pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/mimc.circom";

template GetMerkleRoot(k){
    
    signal input leaf;

    signal input paths2_root[k];

    signal input paths2_root_pos[k]; // 01001 ...


    // the output variable
    signal output out;
    
    // hash of first two entries in Merkle proof
    component hashes[k];
    hashes[0] =  MultiMiMC7(2,91);


    hashes[0].in[0] <== leaf - paths2_root_pos[0]* (leaf - paths2_root[0]); // in MultiMiMC7 function
    hashes[0].in[1] <== paths2_root[0] - paths2_root_pos[0]* (paths2_root[0] - leaf);
    hashes[0].k <== 1;
    
    // hash of all other entries in tx Merkle proof
    for (var v = 1; v < k; v++){
        hashes[v] =  MultiMiMC7(2,91);
        hashes[v].in[0] <== hashes[v - 1].out - paths2_root_pos[v] * (hashes[v - 1].out - paths2_root[v]);
        hashes[v].in[1] <== paths2_root[v] - paths2_root_pos[v] * (paths2_root[v] - hashes[v - 1].out);
        hashes[v].k <== 1;
    }

    // output computed Merkle root
    out <== hashes[k-1].out;
}

