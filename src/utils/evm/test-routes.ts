
import { EVMAssetTransfer, EVMGenericMessageTransfer, Environment, EthereumConfig, EvmResource, ResourceType, SubstrateConfig } from '@buildwithsygma/sygma-sdk-core'
import { BigNumber, Wallet, providers, utils } from 'ethers'
import { RpcEndpoints } from '../../types'

import { KeyringPair } from '@polkadot/keyring/types'
import { Storage__factory } from '../Contracts'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { AccountInfo } from '@polkadot/types/interfaces'
import { LoggingData, fetchTokenAmount, sleep, waitUntilBridgedFungibleEvm } from '../helpers'
import { print } from 'gluegun'

const executionContractAddresses = {
  EXECUTE_CONTRACT_ADDRESS_1:
    '0xdFA5621F95675D37248bAc9e536Aab4D86766663',
  EXECUTE_CONTRACT_ADDRESS_2:
    '0x0e963aEe445EDC19034e9938570E5E7BE4Ee19Cd'
}
const EXECUTE_FUNCTION_SIGNATURE = '0xa271ced2'
const MAX_FEE = '3000000'
export async function testEvmRoutes(
  ethereumConfigs: Array<EthereumConfig>,
  SubstrateConfig: Array<SubstrateConfig>,
  rpcEndpoints: RpcEndpoints,
  evmWallet: Wallet,
  substrateWallet: KeyringPair,
  environment: Environment,
): Promise<string> {
  let result = ""
  for (const network of ethereumConfigs) {
    const sourceProvider = new providers.JsonRpcProvider(rpcEndpoints[network.chainId])
    evmWallet = new Wallet(evmWallet.privateKey, sourceProvider)
    const functionCalls = [] as any

    // EVM -> EVM transfer
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
                    '500000000000'
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

                  const valueBefore = await fetchTokenAmount(
                    destinationProvider,
                    await evmWallet.getAddress(),
                    destinationResource.address
                  )

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

                  const contractValueBefore = await fetchGenericContractValue(
                    executionContractAddresses[`EXECUTE_CONTRACT_ADDRESS_${destinationDomain.id}`],
                    destinationProvider,
                    await evmWallet.getAddress()
                  )

                  await evmWallet.sendTransaction(
                    genericTransferTx as providers.TransactionRequest
                  )

                  functionCalls.push(waitUntilBridgedGenericEvm(
                    loggingData,
                    result,
                    contractValueBefore,
                    executionContractAddresses[`EXECUTE_CONTRACT_ADDRESS_${destinationDomain.id}`],
                    destinationProvider,
                    await evmWallet.getAddress()
                  ))
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

      // EVM -> SUBSTRATE
      for (const destinationDomain of SubstrateConfig) {
        const loggingData = {
          resourceId: resource.resourceId,
          sourceDomainId: network.id,
          sourceDomainName: network.name,
          destinationDomainId: destinationDomain.id,
          destinationDomainName: destinationDomain.name
        }
        try {
          const destinationProvider = new WsProvider(rpcEndpoints[destinationDomain.chainId])
          const api = await ApiPromise.create({
            provider: destinationProvider
          })
          for (const destinationResource of destinationDomain.resources as unknown as Array<EvmResource>) {
            if (destinationResource.resourceId === resource.resourceId) {
              const assetTransfer = new EVMAssetTransfer()

              await assetTransfer.init(
                sourceProvider as providers.BaseProvider,
                Environment[environment]
              )

              const transfer = await assetTransfer.createFungibleTransfer(
                await evmWallet.getAddress(),
                destinationDomain.chainId,
                substrateWallet.address,
                resource.resourceId,
                '500000000000'
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

              const valueBefore = (
                await api.query.system.account<AccountInfo>(
                  substrateWallet.address
                )
              ).data.free

              functionCalls.push(waitUntilBridgedFungibleSubstrate(
                loggingData,
                result,
                valueBefore.toHuman(),
                api,
                substrateWallet.address
              ))
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
        print.info('Transaction successfully bridged.' + loggingData)
        result = `resource ${loggingData.resourceId} succesfully bridged from domain ${loggingData.sourceDomainId}(${loggingData.sourceDomainName}) to domain ${loggingData.destinationDomainId}(${loggingData.destinationDomainName}) - PASSED`
        resolve(result);
        return;
      }
      i++
      if (i > attempts) {
        // transaction should have been bridged already
        print.info('transaction is taking too much time to bridge!' + loggingData)
        result = `resource ${loggingData.resourceId} unable to bridged from domain ${loggingData.sourceDomainId}(${loggingData.sourceDomainName}) to domain ${loggingData.destinationDomainId}(${loggingData.destinationDomainName}) - FAILED`
        resolve(result);
        return;
      }
    }
  })
}

const waitUntilBridgedFungibleSubstrate = async (
  loggingData: LoggingData,
  result: string,
  valueBefore: string,
  api: ApiPromise,
  account: string,
  intervalDuration: number = 120000,
  attempts: number = 5
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    let i = 0
    let valueAfter: string
    for (; ;) {
      await sleep(intervalDuration)
      valueAfter = (
        await api.query.system.account<AccountInfo>(account)
      ).data.free.toHuman()
      if (valueAfter !== valueBefore) {
        print.info('Transaction successfully bridged.' + loggingData)
        result = `resource ${loggingData.resourceId} succesfully bridged from domain ${loggingData.sourceDomainId}(${loggingData.sourceDomainName}) to domain ${loggingData.destinationDomainId}(${loggingData.destinationDomainName}) - PASSED`
        resolve(result);
        return;
      }
      i++
      if (i > attempts) {
        // transaction should have been bridged already
        print.info('transaction is taking too much time to bridge!' + loggingData)
        result = `resource ${loggingData.resourceId} unable to bridged from domain ${loggingData.sourceDomainId}(${loggingData.sourceDomainName}) to domain ${loggingData.destinationDomainId}(${loggingData.destinationDomainName}) - FAILED`
        resolve(result);
        return;
      }
    }
  })
}