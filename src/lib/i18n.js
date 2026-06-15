import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const t = {
  en: {
    appName:'arcanvas', connect:'Connect Wallet', disconnect:'Disconnect',
    balance:'Balance', send:'Send', recipient:'Recipient Address',
    amount:'Amount', estFee:'Est. Fee', confirm:'Confirm Transfer',
    sending:'Sending…', success:'Confirmed', verify:'Verify on ArcScan',
    txHash:'Tx Hash', block:'Block', gasUsed:'Gas Used',
    wrongNetwork:'Switch to Arc Testnet', insufficient:'Insufficient balance',
    history:'History', noHistory:'No transfers yet',
    receiverGets:'Receiver gets', feeNote:'Fee from your wallet',
    ask:'Ask AI', aiPlaceholder:'Ask anything about this transfer…',
    pasteKey:'Paste your OpenRouter key in Vercel env vars',
  },
  hi: {
    appName:'arcanvas', connect:'वॉलेट जोड़ें', disconnect:'हटाएं',
    balance:'बैलेंस', send:'भेजें', recipient:'प्राप्तकर्ता पता',
    amount:'राशि', estFee:'अनुमानित शुल्क', confirm:'ट्रांसफर पुष्टि करें',
    sending:'भेजा जा रहा है…', success:'पुष्टि हो गई', verify:'ArcScan पर देखें',
    txHash:'Tx हैश', block:'ब्लॉक', gasUsed:'Gas उपयोग',
    wrongNetwork:'Arc Testnet पर जाएं', insufficient:'अपर्याप्त बैलेंस',
    history:'इतिहास', noHistory:'कोई ट्रांसफर नहीं',
    receiverGets:'मिलेगा', feeNote:'शुल्क आपके वॉलेट से',
    ask:'AI से पूछें', aiPlaceholder:'इस ट्रांसफर के बारे में पूछें…',
    pasteKey:'Vercel env में OpenRouter key डालें',
  },
  es: {
    appName:'arcanvas', connect:'Conectar Wallet', disconnect:'Desconectar',
    balance:'Saldo', send:'Enviar', recipient:'Dirección destinatario',
    amount:'Monto', estFee:'Tarifa estimada', confirm:'Confirmar transferencia',
    sending:'Enviando…', success:'Confirmado', verify:'Ver en ArcScan',
    txHash:'Hash Tx', block:'Bloque', gasUsed:'Gas usado',
    wrongNetwork:'Cambiar a Arc Testnet', insufficient:'Saldo insuficiente',
    history:'Historial', noHistory:'Sin transferencias',
    receiverGets:'Recibe', feeNote:'Tarifa de tu wallet',
    ask:'Preguntar IA', aiPlaceholder:'Pregunta sobre esta transferencia…',
    pasteKey:'Pega tu key de OpenRouter en Vercel env vars',
  },
  zh: {
    appName:'arcanvas', connect:'连接钱包', disconnect:'断开',
    balance:'余额', send:'发送', recipient:'收款地址',
    amount:'金额', estFee:'预估手续费', confirm:'确认转账',
    sending:'发送中…', success:'已确认', verify:'在ArcScan上查看',
    txHash:'交易哈希', block:'区块', gasUsed:'Gas用量',
    wrongNetwork:'切换到Arc测试网', insufficient:'余额不足',
    history:'记录', noHistory:'暂无转账',
    receiverGets:'到账', feeNote:'手续费从钱包扣除',
    ask:'问AI', aiPlaceholder:'询问此次转账相关问题…',
    pasteKey:'在Vercel env vars中填写OpenRouter密钥',
  },
};

const resources = Object.fromEntries(
  Object.entries(t).map(([lang, vals]) => [lang, { common: vals }])
);

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: typeof window !== 'undefined' ? navigator.language.split('-')[0] : 'en',
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
  });
}

export default i18n;
