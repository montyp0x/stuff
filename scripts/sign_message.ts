import hre from "hardhat";
import { parseEther, toUtf8Bytes, hexlify } from "ethers";

async function main() {
    await hre.run("compile");
    
    // Get the signer (deployer account)
    const signers = await hre.ethers.getSigners();
    
    
    const signer = signers[0];
    console.log("Sending transaction from account:", signer.address);
    console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(signer.address)), "ETH");

    // Configuration
    const recipientAddress = signer.address; // Send to yourself (safe for testing)
    const messageText = "montyp0x"; // Your message here
    const valueToSend = parseEther("0"); // Amount of ETH to send (0 for message only)

    // Convert message to bytes
    const messageBytes = toUtf8Bytes(messageText);
    const messageHex = hexlify(messageBytes);

    console.log("Message:", messageText);
    console.log("Message in hex:", messageHex);
    console.log("Recipient:", recipientAddress);

    try {
        // Estimate gas first
        const gasEstimate = await signer.estimateGas({
            to: recipientAddress,
            value: valueToSend,
            data: messageHex,
        });
        
        console.log("Estimated gas:", gasEstimate.toString());

        // Send transaction with message in data field
        const tx = await signer.sendTransaction({
            to: recipientAddress,
            value: valueToSend,
            data: messageHex,
            gasLimit: gasEstimate + 10000n, // Add buffer to estimated gas
        });

        console.log("Transaction sent!");
        console.log("Transaction hash:", tx.hash);
        console.log("Waiting for confirmation...");

        // Wait for transaction to be mined
        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt?.blockNumber);
        console.log("Gas used:", receipt?.gasUsed.toString());
        
        // Verify the message in the transaction
        const txData = await hre.ethers.provider.getTransaction(tx.hash);
        if (txData?.data) {
            console.log("Message in transaction data:", hre.ethers.toUtf8String(txData.data));
        }

    } catch (error) {
        console.error("Error sending transaction:", error);
    }
}

// Alternative function for sending message to a contract
async function sendMessageToContract(contractAddress: string, message: string) {
    const signers = await hre.ethers.getSigners();
    if (signers.length === 0) {
        console.error("No signers available for contract interaction");
        return;
    }
    const signer = signers[0];
    
    // Example contract ABI for a simple message storage function
    const contractABI = [
        "function storeMessage(string memory _message) public",
        "function getMessage() public view returns (string memory)"
    ];
    
    try {
        const contract = new hre.ethers.Contract(contractAddress, contractABI, signer);
        
        console.log("Sending message to contract:", contractAddress);
        console.log("Message:", message);
        
        const tx = await contract.storeMessage(message);
        console.log("Transaction hash:", tx.hash);
        
        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt?.blockNumber);
        
        // Read back the message (if contract supports it)
        try {
            const storedMessage = await contract.getMessage();
            console.log("Stored message:", storedMessage);
        } catch (readError) {
            console.log("Could not read message from contract (function may not exist)");
        }
        
    } catch (error) {
        console.error("Error interacting with contract:", error);
    }
}

// Function to send signed message (for off-chain verification)
async function signMessage(message: string) {
    const signers = await hre.ethers.getSigners();
    if (signers.length === 0) {
        console.error("No signers available for message signing");
        return;
    }
    const signer = signers[0];
    
    try {
        console.log("Signing message:", message);
        console.log("Signer address:", signer.address);
        
        const signature = await signer.signMessage(message);
        console.log("Signature:", signature);
        
        // Verify the signature
        const recoveredAddress = hre.ethers.verifyMessage(message, signature);
        console.log("Recovered address:", recoveredAddress);
        console.log("Signature valid:", recoveredAddress.toLowerCase() === signer.address.toLowerCase());
        
        return {
            message,
            signature,
            signer: signer.address
        };
        
    } catch (error) {
        console.error("Error signing message:", error);
    }
}

// Main execution
main()
    .then(() => {
        console.log("\n--- Additional Options ---");
        console.log("To send message to a contract, uncomment and modify the line below:");
        console.log("// await sendMessageToContract('0xYourContractAddress', 'Your message');");
        console.log("\nTo sign a message off-chain, uncomment the line below:");
        console.log("// await signMessage('Your message to sign');");
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
