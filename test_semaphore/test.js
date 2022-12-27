const { Identity } = require("@semaphore-protocol/identity")
const { Group } = require("@semaphore-protocol/group")
const { generateProof, verifyProof } = require("@semaphore-protocol/proof")
const fs = require('fs')
async function main(){
    // Create a random identity
    const { trapdoor, nullifier, commitment } = new Identity()
    // Create a deterministic identity

    const identity1 = new Identity("secret-message")
    // Export your identity

    const identity_same = new Identity(identity1.toString())

    const identity2 = new Identity("aaaa")

    // add group 

    const group = new Group(16, BigInt(1))
    group.addMember(commitment)
    
    group.addMember(identity1.commitment)
    group.addMember(identity2.commitment)
    //group.updateMember(0, commitment2)
    //group.removeMember(0)
    const identity3 = new Identity("vvvv")


    const externalNullifier = group.root
    const greeting = "Hello_world"

    const fullProof = await generateProof(identity1, group, externalNullifier, greeting, {
        zkeyFilePath: "./semaphore.zkey",
        wasmFilePath: "./semaphore.wasm"
    })
    
    
    const verificationKey = JSON.parse(fs.readFileSync("./semaphore.json", "utf-8"))
    const pass = await verifyProof(verificationKey, fullProof).then(v => v.toString())
    console.log(pass)

    // wrong group cannot generate proof  will throw error  
    try{
    const fullProof_ww = await generateProof(identity3, group, externalNullifier, greeting, {
        zkeyFilePath: "./semaphore.zkey",
        wasmFilePath: "./semaphore.wasm"
    })
    const pass_2 = await verifyProof(verificationKey, fullProof_ww)
    console.log(pass_2)  
    }
    catch(e){
        console.log("Wrong! , The identity is not part of the group")
    }
}
main()