pragma circom 2.0.0;
include "./merkleroot.circom";

// checks for existence of leaf in tree of depth k

template checkexist(k){
// k is depth of tree

    signal input leaf;
    signal input root;
    signal input paths2_root_pos[k];
    signal input paths2_root[k];


    component computed_root = GetMerkleRoot(k);
    computed_root.leaf <== leaf;

    for (var w = 0; w < k; w++){
        computed_root.paths2_root[w] <== paths2_root[w];// assign elements from paths2_root
        computed_root.paths2_root_pos[w] <== paths2_root_pos[w];// assign elements from paths2_root_pos
    }
    
    // equality constraint: input tx root === computed tx root
    root === computed_root.out;
}

component main{public [leaf , root, paths2_root , paths2_root_pos]} = checkexist(2);
