import { ethers } from 'ethers';
import { ERC20_ABI, USDC_ADDRESS, txUrl } from './arc';

export async function fetchBalances(provider, address) {
    const ethBal = await provider.getBalance(address);
    let usdc = '0';
    try {
        const token = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
        const [dec, symbol] = await Promise.all([
            token.decimals(),
            token.symbol()
        ]);
        const raw = await token.balanceOf(address);
        usdc = ethers.formatUnits(raw, dec);
    } catch (e) { /* USDC fetch failed */ }
    return { eth: ethers.formatEther(ethBal), usdc };
}

export async function estimateFee(provider, from, to, amount, asset, usdcDecimals = 6) {
    const feeData = await provider.getFeeData();
    let gasLimit;
    if (asset === 'ARC') {
        gasLimit = await provider.estimateGas({ from, to, value: ethers.parseEther(amount || '0') });
    } else {
        const token = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
        gasLimit = await token.getFunction('transfer').estimateGas(to, ethers.parseUnits(amount || '0', usdcDecimals));
    }
    return { fee: ethers.formatEther(gasLimit * feeData.gasPrice), gasLimit: gasLimit.toString() };
}

export async function sendArc(signer, to, amount) {
    const tx = await signer.sendTransaction({ to, value: ethers.parseEther(amount) });
    const receipt = await tx.wait();
    return { txHash: receipt.hash, arcScanUrl: txUrl(receipt.hash) };
}

export async function sendUsdc(signer, to, amount, decimals = 6) {
    const token = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
    const tx = await token.getFunction('transfer')(to, ethers.parseUnits(amount, decimals));
    const receipt = await tx.wait();
    return { txHash: receipt.hash, arcScanUrl: txUrl(receipt.hash) };
}
