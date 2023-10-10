
import { EVMAssetTransfer, EVMGenericMessageTransfer, Environment, EthereumConfig, EvmResource, Resource, ResourceType } from '@buildwithsygma/sygma-sdk-core'
import { BigNumber, Wallet, providers, utils } from 'ethers'
import { RpcEndpoints } from '../../types'

import { Storage__factory } from '../Contracts'
import { LoggingData, fetchTokenAmount, sleep, waitUntilBridgedFungibleEvm } from '../helpers'
import { print } from 'gluegun'

const executionContractAddresses = {
  EXECUTE_CONTRACT_ADDRESS_1:
    '0xdFA5621F95675D37248bAc9e536Aab4D86766663',
  EXECUTE_CONTRACT_ADDRESS_2:
    '0x0e963aEe445EDC19034e9938570E5E7BE4Ee19Cd'
}
const DEPOSIT_AMOUNT = '500000000000'
const EXECUTE_FUNCTION_SIGNATURE = '0xa271ced2'
const MAX_FEE = '3000000'
export async function testEvmToEvmRoutes(
  ethereumConfigs: Array<EthereumConfig>,
  rpcEndpoints: RpcEndpoints,
  evmWallet: Wallet,
  environment: Environment,
): Promise<string> {
  let result = ""
  for (const network of ethereumConfigs) {
    const sourceProvider = new providers.JsonRpcProvider(rpcEndpoints[network.chainId])
    evmWallet = new Wallet(evmWallet.privateKey, sourceProvider)
    const functionCalls = [] as any

    for (const resource of network.resources) {
      for (const destinationDomain of ethereumConfigs) {
        const loggingData = {
          resourceId: resource.resourceId,
          sourceDomainId: network.id,
          sourceDomainName: network.name,
          destinationDomainId: destinationDomain.id,
          destinationDomainName: destinationDomain.name
        }
        try {
          const destinationProvider = new providers.JsonRpcProvider(rpcEndpoints[destinationDomain.chainId])

          if (destinationDomain.id == network.id) {
            continue
          }

          for (const destinationResource of destinationDomain.resources as unknown as Array<EvmResource>) {
            if (destinationResource.resourceId === resource.resourceId) {
              switch (resource.type) {
                case ResourceType.FUNGIBLE:
                  const valueBefore = await fetchTokenAmount(
                    destinationProvider,
                    await evmWallet.getAddress(),
                    destinationResource.address
                  )
                  await makeFungibleTransfer(sourceProvider, environment, evmWallet, destinationDomain, resource)

                  functionCalls.push(waitUntilBridgedFungibleEvm(
                    loggingData,
                    result,
                    valueBefore,
                    await evmWallet.getAddress(),
                    destinationResource.address,
                    destinationProvider
                  ))
                  break
                case ResourceType.PERMISSIONLESS_GENERIC:
                  if(executionContractAddresses[`EXECUTE_CONTRACT_ADDRESS_${destinationDomain.id}`]) {
                    const contractValueBefore = await fetchGenericContractValue(
                      executionContractAddresses[`EXECUTE_CONTRACT_ADDRESS_${destinationDomain.id}`],
                      destinationProvider,
                      await evmWallet.getAddress()
                    )
                    await makeGenericTransfer(sourceProvider, environment, evmWallet, destinationDomain, resource)
                    functionCalls.push(waitUntilBridgedGenericEvm(
                      loggingData,
                      result,
                      contractValueBefore,
                      executionContractAddresses[`EXECUTE_CONTRACT_ADDRESS_${destinationDomain.id}`],
                      destinationProvider,
                      await evmWallet.getAddress()
                    ))
                  }
                  break
                case ResourceType.NON_FUNGIBLE:
                  print.warning("not implemented for type: " + ResourceType.NON_FUNGIBLE);
                  break;
                case ResourceType.PERMISSIONED_GENERIC:
                  print.warning(
                    'not implemented for type: ' + ResourceType.NON_FUNGIBLE
                  )
                  break
                default:
                  print.error(`INVALID RESOURCE TYPE`)
              }
            }
          }

        } catch (err) {
          print.error(err)
          result += `\n resource ${loggingData.resourceId} unable to bridged from domain ${loggingData.sourceDomainId}(${loggingData.sourceDomainName}) to domain ${loggingData.destinationDomainId}(${loggingData.destinationDomainName}) - FAILED \n`
        }
      }
    }
    result += (await Promise.all(functionCalls)).join("\n")
  }
  return result
}

async function makeFungibleTransfer(sourceProvider: providers.JsonRpcProvider, environment: Environment, evmWallet: Wallet, destinationDomain: EthereumConfig, resource: Resource) {
  const assetTransfer = new EVMAssetTransfer()
  await assetTransfer.init(
    sourceProvider as providers.BaseProvider,
    Environment[environment]
  )

  const transfer = await assetTransfer.createFungibleTransfer(
    await evmWallet.getAddress(),
    destinationDomain.chainId,
    await evmWallet.getAddress(),
    resource.resourceId,
    DEPOSIT_AMOUNT
  )

  const fee = await assetTransfer.getFee(transfer)

  const approvals = await assetTransfer.buildApprovals(
    transfer,
    fee
  )

  for (const approval of approvals) {
    await evmWallet.sendTransaction(
      approval as providers.TransactionRequest
    )
  }

  const transferTx =
    await assetTransfer.buildTransferTransaction(
      transfer,
      fee
    )

  await evmWallet.sendTransaction(
    transferTx as providers.TransactionRequest
  )
}

async function makeGenericTransfer(sourceProvider: providers.JsonRpcProvider, environment: Environment, evmWallet: Wallet, destinationDomain: EthereumConfig, resource: Resource) {
  const messageTransfer = new EVMGenericMessageTransfer()

  await messageTransfer.init(
    sourceProvider as unknown as any,
    Environment[environment]
  )

  const EXECUTION_DATA = utils.defaultAbiCoder.encode(
    ['uint'],
    [Date.now()]
  )

  const genericTransfer = messageTransfer.createGenericMessageTransfer(
    await evmWallet.getAddress(),
    destinationDomain.chainId,
    resource.resourceId,
    executionContractAddresses[`EXECUTE_CONTRACT_ADDRESS_${destinationDomain.id}`],
    EXECUTE_FUNCTION_SIGNATURE,
    EXECUTION_DATA,
    MAX_FEE
  )

  const genericFee = await messageTransfer.getFee(genericTransfer)
  const genericTransferTx =
    await messageTransfer.buildTransferTransaction(
      genericTransfer,
      genericFee
    )
  await evmWallet.sendTransaction(
    genericTransferTx as providers.TransactionRequest
  )
}

async function fetchGenericContractValue(
  executionContractAddress: string,
  destinationProvider: providers.Provider,
  depositor: string
): Promise<BigNumber> {
  const storageContract = Storage__factory.connect(
    executionContractAddress,
    destinationProvider
  )
  return await storageContract.retrieve(depositor)
}

const waitUntilBridgedGenericEvm = async (
  loggingData: LoggingData,
  result: string,
  valueBefore: BigNumber,
  executionContractAddress: string,
  destinationProvider: providers.Provider,
  depositor: string,
  intervalDuration: number = 120000,
  attempts: number = 5
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    let i = 0
    let valueAfter: BigNumber
    for (; ;) {
      await sleep(intervalDuration)
      valueAfter = await fetchGenericContractValue(
        executionContractAddress,
        destinationProvider,
        depositor
      )
      if (!valueAfter.eq(valueBefore)) {
        print.info('Transaction successfully bridged.' + JSON.stringify(loggingData))
        result = `resource ${loggingData.resourceId} succesfully bridged from domain ${loggingData.sourceDomainId}(${loggingData.sourceDomainName}) to domain ${loggingData.destinationDomainId}(${loggingData.destinationDomainName}) - PASSED`
        resolve(result);
        return;
      }
      i++
      if (i > attempts) {
        // transaction should have been bridged already
        print.info('transaction is taking too much time to bridge!' + JSON.stringify(loggingData))
        result = `resource ${loggingData.resourceId} unable to bridged from domain ${loggingData.sourceDomainId}(${loggingData.sourceDomainName}) to domain ${loggingData.destinationDomainId}(${loggingData.destinationDomainName}) - FAILED \n`
        resolve(result);
        return;
      }
    }
  })
}