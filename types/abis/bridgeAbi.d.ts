export declare const bridgeAbi: ({
    inputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    stateMutability: string;
    type: string;
    name?: undefined;
    anonymous?: undefined;
    outputs?: undefined;
} | {
    inputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    type: string;
    stateMutability?: undefined;
    anonymous?: undefined;
    outputs?: undefined;
} | {
    anonymous: boolean;
    inputs: {
        indexed: boolean;
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    type: string;
    stateMutability?: undefined;
    outputs?: undefined;
} | {
    inputs: ({
        components: {
            internalType: string;
            name: string;
            type: string;
        }[];
        internalType: string;
        name: string;
        type: string;
    } | {
        internalType: string;
        name: string;
        type: string;
        components?: undefined;
    })[];
    name: string;
    outputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    stateMutability: string;
    type: string;
    anonymous?: undefined;
})[];
//# sourceMappingURL=bridgeAbi.d.ts.map