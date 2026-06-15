import { ethers } from 'ethers';
import { ERC20_ABI, USDC_ADDRESS, txUrl } from './arc';

export async function fetchBalances(provider, address) {
  const ethBal = await provider.getBalance(address);
  let usdc = '0', usdcDecimals = 6, usdcSymbol = 'USDC';
  try {
    const token = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
    const [raw, dec, sym] = await Promise.all([
      token.balanceOf(address),
      token.decimals(),
      token.symbol(),
    ]);
    usdcDecimals = Number(dec);
    usdc = ethers.formatUnits(raw, usdcDecimals);
    usdcSymbol = sym;
  } catch { /* USDC not deployed yet on this testnet */ }
  return { eth: ethers.formatEther(ethBal), usdc, usdcDecimals, usdcSymbol };
}

export async function estimateFee(provider, from, to, amount, asset, usdcDecimals = 6) {
  const feeData = await provider.getFeeData();
  let gasLimit;
  if (asset === 'ARC') {
    gasLimit = await provider.estimateGas({ from, to, value: ethers.parseEther(amount || '0') });
  } else {
    const token = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
    gasLimit = await token.transfer.estimateGas(to, ethers.parseUnits(amount || '0', usdcDecimals), { from });
  }
  const feeWei = gasLimit * feeData.gasPrice;
  return { feeEth: ethers.formatEther(feeWei), feeWei, gasLimit };
}

export async function sendArc(signer, to, amount) {
  const tx = await signer.sendTransaction({ to, value: ethers.parseEther(amount) });
  const receipt = await tx.wait();
  return { txHash: receipt.hash, arcScanUrl: txUrl(receipt.hash), blockNumber: receipt.blockNumber, gasUsed: receipt.gasUsed.toString() };
}

export async function sendUsdc(signer, to, amount, decimals = 6) {
  const token = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
  const tx = await token.transfer(to, ethers.parseUnits(amount, decimals));
  const receipt = await tx.wait();
  return { txHash: receipt.hash, arcScanUrl: txUrl(receipt.hash), blockNumber: receipt.blockNumber, gasUsed: receipt.gasUsed.toString() };
}
