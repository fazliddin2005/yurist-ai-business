// seed.js — boshlang'ich (demo) ma'lumotlar: hujjat shablonlari ro'yxati.
// Advokatlar hozircha yo'q -- real advokatlar biz bilan shartnoma tuzilgandan
// keyin birma-bir qo'shiladi (bu massivga obyekt qo'shish kifoya).
const LAWYERS = [];

const TEMPLATES = [
  { key: 'rent', cat: "Ko'chmas mulk", icon: '🏠', name: 'Ijara shartnomasi', desc: "Ko'chmas mulkni ijaraga berish shartnomasi" },
  { key: 'realty', cat: "Ko'chmas mulk", icon: '🏢', name: "Ko'chmas mulk shartnomasi", desc: "Ko'chmas mulk oldi-sotdisi bo'yicha shartnoma" },
  { key: 'car', cat: 'Avtomobil', icon: '🚗', name: 'Avtomobil ijarasi', desc: 'Avtotransport vositasini ijaraga berish shartnomasi' },
  { key: 'sale', cat: 'Shaxsiy va Oilaviy', icon: '📄', name: 'Oldi-sotdi shartnomasi', desc: "Tovar oldi-sotdisi bo'yicha umumiy shartnoma" },
  { key: 'poa', cat: 'Shaxsiy va Oilaviy', icon: '👤', name: 'Ishonchnoma', desc: "Vakolat berish to'g'risidagi ishonchnoma" },
  { key: 'employment', cat: 'Mehnat', icon: '⚖️', name: 'Mehnat shartnomasi', desc: 'Ish beruvchi va xodim o\'rtasidagi shartnoma' },
  { key: 'loan', cat: 'Moliyaviy', icon: '💼', name: 'Qarz shartnomasi', desc: "Pul qarzi berish to'g'risidagi shartnoma" },
  { key: 'service', cat: 'Moliyaviy', icon: '⭐', name: "Xizmat ko'rsatish shartnomasi", desc: "Xizmatlar ko'rsatish bo'yicha shartnoma" },
  { key: 'marriage', cat: 'Shaxsiy va Oilaviy', icon: '💍', name: 'Nikoh shartnomasi', desc: "Er-xotin o'rtasidagi mol-mulkiy munosabatlar shartnomasi" },
  { key: 'donation', cat: 'Shaxsiy va Oilaviy', icon: '🎁', name: 'Hadiya (sovga) shartnomasi', desc: "Mol-mulkni bepul topshirish to'g'risidagi shartnoma" },
  { key: 'nda', cat: 'Moliyaviy', icon: '🔒', name: 'Maxfiylik shartnomasi (NDA)', desc: "Tijorat siri va maxfiy ma'lumotni himoya qilish shartnomasi" },
  { key: 'termination', cat: 'Shaxsiy va Oilaviy', icon: '❌', name: 'Shartnomani bekor qilish bitimi', desc: "Ilgari tuzilgan shartnomani bekor qilish to'g'risida" },
  { key: 'will', cat: 'Shaxsiy va Oilaviy', icon: '📜', name: 'Vasiyatnoma', desc: "Meros qoldirish to'g'risidagi vasiyatnoma" },
  { key: 'partnership', cat: 'Moliyaviy', icon: '🤝', name: 'Hamkorlik shartnomasi', desc: "Qo'shma faoliyat va sheriklik shartnomasi" },
  { key: 'contractor', cat: 'Mehnat', icon: '🔨', name: 'Pudrat shartnomasi', desc: 'Pudratchi tomonidan ish bajarish shartnomasi' },
  { key: 'renovation', cat: "Ko'chmas mulk", icon: '🛠️', name: "Ta'mirlash ishlari shartnomasi", desc: "Bino/xonadonni ta'mirlash bo'yicha shartnoma" },
];

module.exports = { LAWYERS, TEMPLATES };
