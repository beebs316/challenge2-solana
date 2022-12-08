// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

const DEMO_FROM_SECRET_KEY = new Uint8Array(
    [
        51,  74, 142,  29,  61,  37,  60,  67,  10, 112,  22,
        43, 191, 118, 181, 238, 149,   6, 196, 172,  62,  48,
       108, 227, 181,  13,  39,  98,  92, 171, 235,  41,  87,
       179,  56,  67, 154, 209,  41, 183, 129, 112, 167,  73,
       242,  75, 183, 152,  16, 144, 214,  99, 104, 218, 146,
        56, 172, 104, 225, 182,  33,  19, 216, 200
     ]            
);


// Get the wallet balance from a given private key
const getWalletBalance = async (walletName, newPair) => {
    
    try {
        // Connect to the Devnet
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        //console.log("Connection object is:", connection);

        // Make a wallet (keypair) from privateKey and get its balance
        //const myWallet = await Keypair.fromSecretKey(privateKey);
        const walletBalance = await connection.getBalance(
            new PublicKey(newPair.publicKey)
        );
        console.log(walletName, `Wallet balance: ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`);
        var currentWalletBalance = Number((walletBalance) / LAMPORTS_PER_SOL)
    } catch (err) {
        console.log(err);
    }
    
    return currentWalletBalance
    
};


const transferSol = async() => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Get Keypair from Secret Key
    var from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);
    var fromWalletBalance = 0
    var toWalletBalance = 0
    var sendAmount = 0

    // Other things to try: 
    // 1) Form array from userSecretKey
    // const from = Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
    // 2) Make a new Keypair (starts with 0 SOL)

    //use this method 
    // const from = Keypair.generate();
    // generate secret key from above: from.secretKey


    // Generate another Keypair (account we'll be sending to)
    const to = Keypair.generate();

    fromWalletBalance = getWalletBalance("From",from);
    //await new Promise(resolve => setTimeout(resolve, 100));
    toWalletBalance = getWalletBalance("To", to);
    //await new Promise(resolve => setTimeout(resolve, 500));
    
    // Aidrop 2 SOL to Sender wallet
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });
    console.log("Airdrop completed for the Sender account");

    fromWalletBalance = getWalletBalance("From",from);
    //await new Promise(resolve => setTimeout(resolve, 100));
    toWalletBalance = getWalletBalance("To", to);
    //await new Promise(resolve => setTimeout(resolve, 100));

    //Get from wallet balance 
    walletBalance = await connection.getBalance(
        new PublicKey(from.publicKey)
    );
    var currentWalletBalance = Number((walletBalance) / LAMPORTS_PER_SOL)
    currentWalletBalance = currentWalletBalance / 2
    //await new Promise(resolve => setTimeout(resolve, 500));
    console.log("Sending ", currentWalletBalance, " SOL to the recieving wallet");
    
    // Calculate send amount in lamports
    sendAmount = (LAMPORTS_PER_SOL * currentWalletBalance)
    //await new Promise(resolve => setTimeout(resolve, 500));

    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: sendAmount
        })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    console.log('Signature is ', signature);

    fromWalletBalance = getWalletBalance("From",from);
    //await new Promise(resolve => setTimeout(resolve, 500));
    toWalletBalance = getWalletBalance("To", to);
}

//const newPair = Keypair.generate();
//console.log(newPair);

transferSol();