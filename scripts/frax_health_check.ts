import hre from "hardhat";
import { USER_ADDRESS } from "../hardhat.config";


async function main() {
    await hre.run("compile");
    
    let registry = await hre.ethers.getContractAt("IFraxlendPairRegistry", "0xD6E9D27C75Afd88ad24Cd5EdccdC76fd2fc3A751");

    let pairs_r = await registry.getAllPairAddresses();

    let snapshot, pair, pair_address, exchange_rate, exchange_rate_info, constants, 
        ltv_precision, exchange_precision, totalBorrow, borrower_amount, ltv, max_ltv;

    for (pair_address of pairs_r) {
        pair = await hre.ethers.getContractAt("IFraxlendPair", pair_address);
        snapshot = await pair.getUserSnapshot(USER_ADDRESS);
        if (snapshot[0] != 0n || snapshot[1] != 0n || snapshot[2] != 0n) {
            console.log(await pair.symbol());
            console.log("pair address: ", pair_address)

            console.log("The user fToken balance: ", snapshot[0]);
            console.log("The user borrow shares: ", snapshot[1]);
            console.log("The user collateral balance: ", snapshot[2]);

            if (snapshot[1] == 0n && snapshot[2] == 0n) continue;

            exchange_rate_info = await pair.exchangeRateInfo();
            constants = await pair.getConstants();
            totalBorrow = await pair.totalBorrow();

            borrower_amount = toAmount(totalBorrow[1], totalBorrow[0], snapshot[1]);
            
            ltv_precision = constants[0];
            exchange_precision = constants[4];
            
            exchange_rate = exchange_rate_info[1];
            console.log("exchange rate: ", exchange_rate);

            if (borrower_amount == 0n) {
                console.log("LTV is good. borrower_amount == 0");
                continue;
            }

            if (snapshot[2] == 0n) {
                console.log("LTV is bad. collateral_amount == 0");
                continue;
            }

            max_ltv = await pair.maxLTV();

            ltv = (((borrower_amount * exchange_rate) / exchange_precision) * ltv_precision) / snapshot[2];
            console.log("user LTV: ", ltv);
            console.log("max LTV: ", max_ltv);
            console.log();
        }
        
    }
}

function toAmount(total_shares: bigint, total_amount: bigint, shares: bigint) {
    let amount;
    if (total_shares == 0n) {
        amount = shares;
    } else {
        amount = (shares * total_amount) / total_shares;
        if (amount * total_shares / total_amount < shares) {
            amount = amount + 1n;
        }
    }
    return amount;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });