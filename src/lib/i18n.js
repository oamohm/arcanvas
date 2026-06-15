import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const strings = {
  en: {
    connect: 'Connect Wallet', disconnect: 'Disconnect',
    balance: 'Balance', send: 'Send', recipient: 'Recipient',
    amount: 'Amount', estFee: 'Est. Fee', confirm: 'Confirm Transfer',
    sending: 'Sending…', success: 'Confirmed', verify: 'View on ArcScan',
    txHash: 'Tx Hash', block: 'Block', gasUsed: 'Gas Used',
    wrongNetwork: 'Switch to Arc Testnet', insufficient: 'Insufficient balance',
    history: 'History', receiverGets: 'Receiver gets', feeNote: 'Fee from your wallet',
    ask: 'Ask AI', aiPlaceholder: 'Ask about gas, USDC, settlement…',
    treasury: 'Treasury', liquidity: 'Liquidity', compliance: 'Compliance',
    agents: 'Agents', pipeline: 'Pipeline', governance: 'Governance',
    logs: 'Event Log', multisig: 'Multisig Queue', velocity: 'Tx Velocity',
    allChains: 'All Chains', tvl: 'TVL', flow: '24h Flow', apy: 'APY',
    score: 'Score', uptime: 'Uptime', tasks: 'Tasks', passed: 'Passed',
    active: 'Active', pending: 'Pending', execute: 'Execute',
    sigs: 'Sigs', required: 'Required', overview: 'Asset Overview',
  },
  hi: {
    connect: 'वॉलेट जोड़ें', disconnect: 'हटाएं',
    balance: 'बैलेंस', send: 'भेजें', recipient: 'प्राप्तकर्ता',
    amount: 'राशि', estFee: 'अनुमानित शुल्क', confirm: 'पुष्टि करें',
    sending: 'भेजा जा रहा है…', success: 'पुष्टि हो गई', verify: 'ArcScan पर देखें',
    txHash: 'Tx हैश', block: 'ब्लॉक', gasUsed: 'Gas',
    wrongNetwork: 'Arc Testnet पर जाएं', insufficient: 'अपर्याप्त बैलेंस',
    history: 'इतिहास', receiverGets: 'मिलेगा', feeNote: 'शुल्क वॉलेट से',
    ask: 'AI से पूछें', aiPlaceholder: 'Gas, USDC, सेटलमेंट के बारे में पूछें…',
    treasury: 'ट्रेज़री', liquidity: 'लिक्विडिटी', compliance: 'अनुपालन',
    agents: 'एजेंट', pipeline: 'पाइपलाइन', governance: 'गवर्नेंस',
    logs: 'इवेंट लॉग', multisig: 'मल्टीसिग कतार', velocity: 'Tx वेग',
    allChains: 'सभी चेन', tvl: 'TVL', flow: '24h प्रवाह', apy: 'APY',
    score: 'स्कोर', uptime: 'अपटाइम', tasks: 'कार्य', passed: 'पास',
    active: 'सक्रिय', pending: 'लंबित', execute: 'चलाएं',
    sigs: 'हस्ताक्षर', required: 'आवश्यक', overview: 'एसेट ओवरव्यू',
  },
  es: {
    connect: 'Conectar Wallet', disconnect: 'Desconectar',
    balance: 'Saldo', send: 'Enviar', recipient: 'Destinatario',
    amount: 'Monto', estFee: 'Tarifa est.', confirm: 'Confirmar',
    sending: 'Enviando…', success: 'Confirmado', verify: 'Ver en ArcScan',
    txHash: 'Hash Tx', block: 'Bloque', gasUsed: 'Gas usado',
    wrongNetwork: 'Cambiar a Arc Testnet', insufficient: 'Saldo insuficiente',
    history: 'Historial', receiverGets: 'Recibe', feeNote: 'Tarifa de tu wallet',
    ask: 'Preguntar IA', aiPlaceholder: 'Pregunta sobre gas, USDC…',
    treasury: 'Tesorería', liquidity: 'Liquidez', compliance: 'Cumplimiento',
    agents: 'Agentes', pipeline: 'Pipeline', governance: 'Gobernanza',
    logs: 'Registro', multisig: 'Cola Multisig', velocity: 'Velocidad Tx',
    allChains: 'Todas las cadenas', tvl: 'TVL', flow: 'Flujo 24h', apy: 'APY',
    score: 'Puntaje', uptime: 'Uptime', tasks: 'Tareas', passed: 'Aprobado',
    active: 'Activo', pending: 'Pendiente', execute: 'Ejecutar',
    sigs: 'Firmas', required: 'Requerido', overview: 'Resumen de activos',
  },
  zh: {
    connect: '连接钱包', disconnect: '断开',
    balance: '余额', send: '发送', recipient: '收款方',
    amount: '金额', estFee: '预估费用', confirm: '确认转账',
    sending: '发送中…', success: '已确认', verify: '在ArcScan查看',
    txHash: '交易哈希', block: '区块', gasUsed: 'Gas用量',
    wrongNetwork: '切换到Arc测试网', insufficient: '余额不足',
    history: '记录', receiverGets: '到账', feeNote: '手续费从钱包扣除',
    ask: '问AI', aiPlaceholder: '询问Gas、USDC、结算…',
    treasury: '财库', liquidity: '流动性', compliance: '合规',
    agents: '代理', pipeline: '流水线', governance: '治理',
    logs: '事件日志', multisig: '多签队列', velocity: '交易速度',
    allChains: '所有链', tvl: 'TVL', flow: '24h流量', apy: 'APY',
    score: '分数', uptime: '正常运行', tasks: '任务', passed: '通过',
    active: '活跃', pending: '待处理', execute: '执行',
    sigs: '签名', required: '需要', overview: '资产概览',
  },
};

const resources = Object.fromEntries(
  Object.entries(strings).map(([lang, vals]) => [lang, { common: vals }])
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
