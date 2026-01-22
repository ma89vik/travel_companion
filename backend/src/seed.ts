import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TemplateItem {
  name: string;
  nameEn: string;
  category: string;
  categoryEn: string;
}

interface Template {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  items: TemplateItem[];
}

const defaultTemplates: Template[] = [
  {
    name: '出门带',
    nameEn: 'Going Out',
    description: '出门必带物品清单',
    descriptionEn: 'Essential items for going out',
    icon: '🚪',
    items: [
      // 重要 / Important
      { name: '身份证', nameEn: 'ID Card', category: '重要', categoryEn: 'Important' },
      { name: '护照', nameEn: 'Passport', category: '重要', categoryEn: 'Important' },
      { name: '钥匙', nameEn: 'Keys', category: '重要', categoryEn: 'Important' },
      { name: '小白被', nameEn: 'White Blanket', category: '重要', categoryEn: 'Important' },
      { name: '驾照', nameEn: "Driver's License", category: '重要', categoryEn: 'Important' },
      // 电子 / Electronics
      { name: '充电器', nameEn: 'Charger', category: '电子', categoryEn: 'Electronics' },
      { name: '手机', nameEn: 'Phone', category: '电子', categoryEn: 'Electronics' },
      { name: '耳机', nameEn: 'Earphones', category: '电子', categoryEn: 'Electronics' },
      { name: '充电宝', nameEn: 'Power Bank', category: '电子', categoryEn: 'Electronics' },
      { name: 'iPad', nameEn: 'iPad', category: '电子', categoryEn: 'Electronics' },
      { name: '相机', nameEn: 'Camera', category: '电子', categoryEn: 'Electronics' },
      { name: '相机充电器', nameEn: 'Camera Charger', category: '电子', categoryEn: 'Electronics' },
      { name: '电脑', nameEn: 'Laptop', category: '电子', categoryEn: 'Electronics' },
      { name: '硬盘', nameEn: 'Hard Drive', category: '电子', categoryEn: 'Electronics' },
      { name: '插排', nameEn: 'Power Strip', category: '电子', categoryEn: 'Electronics' },
      { name: '无人机', nameEn: 'Drone', category: '电子', categoryEn: 'Electronics' },
      { name: '摄像头', nameEn: 'Webcam', category: '电子', categoryEn: 'Electronics' },
      { name: '牙刷充电器', nameEn: 'Toothbrush Charger', category: '电子', categoryEn: 'Electronics' },
      // 女生 / Women
      { name: '护肤品', nameEn: 'Skincare', category: '女生', categoryEn: 'Women' },
      { name: '化妆品', nameEn: 'Makeup', category: '女生', categoryEn: 'Women' },
      { name: '卸妆油', nameEn: 'Makeup Remover', category: '女生', categoryEn: 'Women' },
      { name: '化妆棉', nameEn: 'Cotton Pads', category: '女生', categoryEn: 'Women' },
      { name: '洗面奶', nameEn: 'Facial Cleanser', category: '女生', categoryEn: 'Women' },
      { name: '洗护发', nameEn: 'Shampoo & Conditioner', category: '女生', categoryEn: 'Women' },
      { name: '面膜', nameEn: 'Face Mask', category: '女生', categoryEn: 'Women' },
      { name: '发油', nameEn: 'Hair Oil', category: '女生', categoryEn: 'Women' },
      { name: '卫生巾/护垫', nameEn: 'Sanitary Pads', category: '女生', categoryEn: 'Women' },
      { name: '防晒', nameEn: 'Sunscreen', category: '女生', categoryEn: 'Women' },
      { name: '纸巾', nameEn: 'Tissues', category: '女生', categoryEn: 'Women' },
      { name: '镊子', nameEn: 'Tweezers', category: '女生', categoryEn: 'Women' },
      { name: '指甲刀', nameEn: 'Nail Clippers', category: '女生', categoryEn: 'Women' },
      { name: '发卡', nameEn: 'Hair Clips', category: '女生', categoryEn: 'Women' },
      { name: '洗漱品', nameEn: 'Toiletries', category: '女生', categoryEn: 'Women' },
      { name: '毛巾', nameEn: 'Towel', category: '女生', categoryEn: 'Women' },
      { name: '保暖', nameEn: 'Warm Clothes', category: '女生', categoryEn: 'Women' },
      { name: '姨妈裤', nameEn: 'Period Underwear', category: '女生', categoryEn: 'Women' },
      { name: '牙膏', nameEn: 'Toothpaste', category: '女生', categoryEn: 'Women' },
      { name: '牙刷', nameEn: 'Toothbrush', category: '女生', categoryEn: 'Women' },
      { name: '梳子', nameEn: 'Comb', category: '女生', categoryEn: 'Women' },
      { name: '镜子', nameEn: 'Mirror', category: '女生', categoryEn: 'Women' },
      { name: '香水', nameEn: 'Perfume', category: '女生', categoryEn: 'Women' },
      { name: '隐形眼镜', nameEn: 'Contact Lenses', category: '女生', categoryEn: 'Women' },
      { name: '滴眼液', nameEn: 'Eye Drops', category: '女生', categoryEn: 'Women' },
      // 服装 / Clothing
      { name: '内衣裤', nameEn: 'Underwear', category: '服装', categoryEn: 'Clothing' },
      { name: '上衣', nameEn: 'Tops', category: '服装', categoryEn: 'Clothing' },
      { name: '裤子', nameEn: 'Pants', category: '服装', categoryEn: 'Clothing' },
      { name: '睡衣', nameEn: 'Pajamas', category: '服装', categoryEn: 'Clothing' },
      { name: '鞋子', nameEn: 'Shoes', category: '服装', categoryEn: 'Clothing' },
      { name: '眼镜', nameEn: 'Glasses', category: '服装', categoryEn: 'Clothing' },
      { name: '墨镜', nameEn: 'Sunglasses', category: '服装', categoryEn: 'Clothing' },
      { name: '帽子', nameEn: 'Hat', category: '服装', categoryEn: 'Clothing' },
      { name: '泳衣', nameEn: 'Swimsuit', category: '服装', categoryEn: 'Clothing' },
      { name: '袜子', nameEn: 'Socks', category: '服装', categoryEn: 'Clothing' },
      // 其他 / Other
      { name: '转换头', nameEn: 'Power Adapter', category: '其他', categoryEn: 'Other' },
      { name: '吹风机', nameEn: 'Hair Dryer', category: '其他', categoryEn: 'Other' },
      { name: '背包', nameEn: 'Backpack', category: '其他', categoryEn: 'Other' },
      { name: '雨伞', nameEn: 'Umbrella', category: '其他', categoryEn: 'Other' },
      { name: '资料文件', nameEn: 'Documents', category: '其他', categoryEn: 'Other' },
      { name: '药品', nameEn: 'Medicine', category: '其他', categoryEn: 'Other' },
      { name: '保温杯', nameEn: 'Thermos', category: '其他', categoryEn: 'Other' },
      { name: '创可贴', nameEn: 'Band-Aids', category: '其他', categoryEn: 'Other' },
      { name: '零食', nameEn: 'Snacks', category: '其他', categoryEn: 'Other' },
      { name: '证件照', nameEn: 'ID Photos', category: '其他', categoryEn: 'Other' },
      { name: '笔', nameEn: 'Pen', category: '其他', categoryEn: 'Other' },
      { name: '记事本', nameEn: 'Notebook', category: '其他', categoryEn: 'Other' },
      { name: '保健品', nameEn: 'Supplements', category: '其他', categoryEn: 'Other' },
      { name: '眼药水', nameEn: 'Eye Drops', category: '其他', categoryEn: 'Other' },
      { name: '风油精', nameEn: 'Medicated Oil', category: '其他', categoryEn: 'Other' },
    ],
  },
  {
    name: '回家带',
    nameEn: 'Going Home',
    description: '回家必带物品清单',
    descriptionEn: 'Essential items for going home',
    icon: '🏠',
    items: [
      { name: '身份证', nameEn: 'ID Card', category: '重要', categoryEn: 'Important' },
      { name: '钥匙', nameEn: 'Keys', category: '重要', categoryEn: 'Important' },
      { name: '充电器', nameEn: 'Charger', category: '电子', categoryEn: 'Electronics' },
      { name: '耳机', nameEn: 'Earphones', category: '电子', categoryEn: 'Electronics' },
      { name: '充电宝', nameEn: 'Power Bank', category: '电子', categoryEn: 'Electronics' },
      { name: '换洗衣服', nameEn: 'Change of Clothes', category: '服装', categoryEn: 'Clothing' },
      { name: '袜子内衣', nameEn: 'Socks & Underwear', category: '服装', categoryEn: 'Clothing' },
      { name: '隐形眼镜', nameEn: 'Contact Lenses', category: '护肤品', categoryEn: 'Skincare' },
      { name: '滴眼液', nameEn: 'Eye Drops', category: '护肤品', categoryEn: 'Skincare' },
      { name: '化妆品', nameEn: 'Makeup', category: '护肤品', categoryEn: 'Skincare' },
      { name: '卸妆油', nameEn: 'Makeup Remover', category: '护肤品', categoryEn: 'Skincare' },
      { name: '面膜', nameEn: 'Face Mask', category: '护肤品', categoryEn: 'Skincare' },
      { name: '牙刷', nameEn: 'Toothbrush', category: '其他', categoryEn: 'Other' },
      { name: '护垫', nameEn: 'Panty Liners', category: '其他', categoryEn: 'Other' },
      { name: '保健品', nameEn: 'Supplements', category: '其他', categoryEn: 'Other' },
      { name: '香水', nameEn: 'Perfume', category: '其他', categoryEn: 'Other' },
      { name: '小朋友', nameEn: 'Little One', category: '其他', categoryEn: 'Other' },
      { name: '眼药水', nameEn: 'Eye Drops', category: '其他', categoryEn: 'Other' },
    ],
  },
  {
    name: '短途旅行',
    nameEn: 'Short Trip',
    description: '短途旅行必带物品',
    descriptionEn: 'Essentials for short trips',
    icon: '🚗',
    items: [
      { name: '身份证', nameEn: 'ID Card', category: '重要', categoryEn: 'Important' },
      { name: '钥匙', nameEn: 'Keys', category: '重要', categoryEn: 'Important' },
      { name: '充电器', nameEn: 'Charger', category: '电子', categoryEn: 'Electronics' },
      { name: '耳机', nameEn: 'Earphones', category: '电子', categoryEn: 'Electronics' },
      { name: '充电宝', nameEn: 'Power Bank', category: '电子', categoryEn: 'Electronics' },
      { name: '手表充电', nameEn: 'Watch Charger', category: '电子', categoryEn: 'Electronics' },
      { name: '内衣裤', nameEn: 'Underwear', category: '服装', categoryEn: 'Clothing' },
      { name: '衣服', nameEn: 'Clothes', category: '服装', categoryEn: 'Clothing' },
      { name: '睡衣', nameEn: 'Pajamas', category: '服装', categoryEn: 'Clothing' },
      { name: '墨镜', nameEn: 'Sunglasses', category: '服装', categoryEn: 'Clothing' },
      { name: '护肤', nameEn: 'Skincare', category: '洗护', categoryEn: 'Toiletries' },
      { name: '牙刷', nameEn: 'Toothbrush', category: '洗护', categoryEn: 'Toiletries' },
      { name: '护理卫生巾', nameEn: 'Sanitary Pads', category: '洗护', categoryEn: 'Toiletries' },
      { name: '隐形眼镜', nameEn: 'Contact Lenses', category: '洗护', categoryEn: 'Toiletries' },
      { name: '滴眼液', nameEn: 'Eye Drops', category: '洗护', categoryEn: 'Toiletries' },
      { name: '芦荟胶', nameEn: 'Aloe Gel', category: '洗护', categoryEn: 'Toiletries' },
      { name: '防晒霜', nameEn: 'Sunscreen', category: '洗护', categoryEn: 'Toiletries' },
      { name: '香水', nameEn: 'Perfume', category: '洗护', categoryEn: 'Toiletries' },
      { name: '眼药水', nameEn: 'Eye Drops', category: '健康', categoryEn: 'Health' },
      { name: '药品', nameEn: 'Medicine', category: '健康', categoryEn: 'Health' },
      { name: '药保健品', nameEn: 'Supplements', category: '健康', categoryEn: 'Health' },
      { name: '消毒酒精', nameEn: 'Disinfectant', category: '健康', categoryEn: 'Health' },
      { name: '驱蚊', nameEn: 'Mosquito Repellent', category: '健康', categoryEn: 'Health' },
      { name: '小白', nameEn: 'White Blanket', category: '其他', categoryEn: 'Other' },
      { name: '雨伞', nameEn: 'Umbrella', category: '其他', categoryEn: 'Other' },
      { name: '烧水壶', nameEn: 'Electric Kettle', category: '其他', categoryEn: 'Other' },
      { name: '耳环', nameEn: 'Earrings', category: '其他', categoryEn: 'Other' },
      { name: '项链', nameEn: 'Necklace', category: '其他', categoryEn: 'Other' },
    ],
  },
  {
    name: '娃日常',
    nameEn: 'Baby Daily',
    description: '带娃日常出门必备',
    descriptionEn: 'Daily essentials for going out with baby',
    icon: '👶',
    items: [
      { name: '尿不湿', nameEn: 'Diapers', category: '日常', categoryEn: 'Daily' },
      { name: '隔尿垫', nameEn: 'Changing Mat', category: '日常', categoryEn: 'Daily' },
      { name: '湿巾', nameEn: 'Wet Wipes', category: '日常', categoryEn: 'Daily' },
      { name: '云柔巾', nameEn: 'Soft Tissues', category: '日常', categoryEn: 'Daily' },
      { name: '奶瓶', nameEn: 'Baby Bottle', category: '日常', categoryEn: 'Daily' },
      { name: '奶粉', nameEn: 'Formula', category: '日常', categoryEn: 'Daily' },
      { name: '热水', nameEn: 'Hot Water', category: '日常', categoryEn: 'Daily' },
      { name: '凉水', nameEn: 'Cold Water', category: '日常', categoryEn: 'Daily' },
      { name: '纱巾', nameEn: 'Muslin Cloth', category: '日常', categoryEn: 'Daily' },
      { name: '毯子', nameEn: 'Blanket', category: '日常', categoryEn: 'Daily' },
      { name: '充电宝', nameEn: 'Power Bank', category: '日常', categoryEn: 'Daily' },
      { name: '通风垫', nameEn: 'Breathable Mat', category: '日常', categoryEn: 'Daily' },
      { name: '背带', nameEn: 'Baby Carrier', category: '日常', categoryEn: 'Daily' },
      { name: '换衣服', nameEn: 'Change of Clothes', category: '日常', categoryEn: 'Daily' },
      { name: '婴儿车', nameEn: 'Stroller', category: '日常', categoryEn: 'Daily' },
      { name: '垃圾袋', nameEn: 'Trash Bags', category: '日常', categoryEn: 'Daily' },
      { name: '面霜', nameEn: 'Baby Cream', category: '日常', categoryEn: 'Daily' },
      { name: '袜子', nameEn: 'Socks', category: '日常', categoryEn: 'Daily' },
      { name: '围嘴', nameEn: 'Bib', category: '日常', categoryEn: 'Daily' },
      { name: '帽子', nameEn: 'Hat', category: '日常', categoryEn: 'Daily' },
      { name: '辅食碗', nameEn: 'Food Bowl', category: '辅食', categoryEn: 'Baby Food' },
      { name: '辅食勺', nameEn: 'Baby Spoon', category: '辅食', categoryEn: 'Baby Food' },
      { name: '辅食锅', nameEn: 'Food Pot', category: '辅食', categoryEn: 'Baby Food' },
      { name: '辅食油', nameEn: 'Baby Oil', category: '辅食', categoryEn: 'Baby Food' },
    ],
  },
  {
    name: '娃旅行',
    nameEn: 'Baby Travel',
    description: '带娃旅行完整清单',
    descriptionEn: 'Complete travel checklist with baby',
    icon: '✈️👶',
    items: [
      { name: '奶瓶', nameEn: 'Baby Bottle', category: '喂养', categoryEn: 'Feeding' },
      { name: '奶粉', nameEn: 'Formula', category: '喂养', categoryEn: 'Feeding' },
      { name: '奶瓶刷', nameEn: 'Bottle Brush', category: '喂养', categoryEn: 'Feeding' },
      { name: '烧水杯', nameEn: 'Electric Kettle', category: '喂养', categoryEn: 'Feeding' },
      { name: '喝水杯', nameEn: 'Sippy Cup', category: '喂养', categoryEn: 'Feeding' },
      { name: '液体辅食', nameEn: 'Baby Food Pouches', category: '喂养', categoryEn: 'Feeding' },
      { name: '辅食', nameEn: 'Baby Food', category: '喂养', categoryEn: 'Feeding' },
      { name: '吃饭围兜', nameEn: 'Feeding Bib', category: '喂养', categoryEn: 'Feeding' },
      { name: '零食', nameEn: 'Snacks', category: '喂养', categoryEn: 'Feeding' },
      { name: '果泥', nameEn: 'Fruit Puree', category: '喂养', categoryEn: 'Feeding' },
      { name: '身份证件', nameEn: 'ID Documents', category: '重要', categoryEn: 'Important' },
      { name: '尿不湿', nameEn: 'Diapers', category: '护理', categoryEn: 'Care' },
      { name: '隔尿垫', nameEn: 'Changing Mat', category: '护理', categoryEn: 'Care' },
      { name: '湿巾', nameEn: 'Wet Wipes', category: '护理', categoryEn: 'Care' },
      { name: '浴巾', nameEn: 'Bath Towel', category: '护理', categoryEn: 'Care' },
      { name: '纱巾', nameEn: 'Muslin Cloth', category: '护理', categoryEn: 'Care' },
      { name: '婴儿毯', nameEn: 'Baby Blanket', category: '护理', categoryEn: 'Care' },
      { name: '牙刷', nameEn: 'Toothbrush', category: '护理', categoryEn: 'Care' },
      { name: '婴儿棉签', nameEn: 'Baby Cotton Swabs', category: '护理', categoryEn: 'Care' },
      { name: '指甲刀', nameEn: 'Nail Clippers', category: '护理', categoryEn: 'Care' },
      { name: '防晒霜', nameEn: 'Sunscreen', category: '护理', categoryEn: 'Care' },
      { name: '药品', nameEn: 'Medicine', category: '护理', categoryEn: 'Care' },
      { name: '婴儿车', nameEn: 'Stroller', category: '出行', categoryEn: 'Transport' },
      { name: '婴儿背带', nameEn: 'Baby Carrier', category: '出行', categoryEn: 'Transport' },
      { name: '高铁坐垫', nameEn: 'Train Seat Cushion', category: '出行', categoryEn: 'Transport' },
      { name: '充气床', nameEn: 'Inflatable Bed', category: '出行', categoryEn: 'Transport' },
      { name: '衣服', nameEn: 'Clothes', category: '服装', categoryEn: 'Clothing' },
      { name: '袜子', nameEn: 'Socks', category: '服装', categoryEn: 'Clothing' },
      { name: '帽子', nameEn: 'Hat', category: '服装', categoryEn: 'Clothing' },
      { name: '手套', nameEn: 'Gloves', category: '服装', categoryEn: 'Clothing' },
      { name: '鞋子', nameEn: 'Shoes', category: '服装', categoryEn: 'Clothing' },
      { name: '围巾', nameEn: 'Scarf', category: '服装', categoryEn: 'Clothing' },
      { name: '防水裤', nameEn: 'Waterproof Pants', category: '服装', categoryEn: 'Clothing' },
      { name: '游泳圈', nameEn: 'Swim Ring', category: '玩水', categoryEn: 'Swimming' },
      { name: '游泳衣', nameEn: 'Swimsuit', category: '玩水', categoryEn: 'Swimming' },
      { name: '洗澡椅', nameEn: 'Bath Chair', category: '玩水', categoryEn: 'Swimming' },
      { name: '洗澡玩具', nameEn: 'Bath Toys', category: '玩水', categoryEn: 'Swimming' },
      { name: '扫描相机', nameEn: 'Instant Camera', category: '电子', categoryEn: 'Electronics' },
      { name: '充电器', nameEn: 'Charger', category: '电子', categoryEn: 'Electronics' },
      { name: 'iPad', nameEn: 'iPad', category: '电子', categoryEn: 'Electronics' },
      { name: '摄像头', nameEn: 'Baby Monitor', category: '电子', categoryEn: 'Electronics' },
      { name: '通风垫', nameEn: 'Breathable Mat', category: '其他', categoryEn: 'Other' },
      { name: '玩具', nameEn: 'Toys', category: '其他', categoryEn: 'Other' },
      { name: '书', nameEn: 'Books', category: '其他', categoryEn: 'Other' },
      { name: '小海马', nameEn: 'Seahorse Toy', category: '其他', categoryEn: 'Other' },
    ],
  },
  {
    name: '露营',
    nameEn: 'Camping',
    description: '户外露营装备清单',
    descriptionEn: 'Outdoor camping equipment list',
    icon: '⛺',
    items: [
      { name: '户外推车', nameEn: 'Wagon Cart', category: '装备', categoryEn: 'Equipment' },
      { name: '帐篷', nameEn: 'Tent', category: '装备', categoryEn: 'Equipment' },
      { name: '户外椅', nameEn: 'Camp Chairs', category: '装备', categoryEn: 'Equipment' },
      { name: '野餐垫', nameEn: 'Picnic Blanket', category: '装备', categoryEn: 'Equipment' },
      { name: '保温箱', nameEn: 'Cooler', category: '装备', categoryEn: 'Equipment' },
      { name: '充气沙发', nameEn: 'Inflatable Sofa', category: '装备', categoryEn: 'Equipment' },
      { name: '雨伞', nameEn: 'Umbrella', category: '装备', categoryEn: 'Equipment' },
      { name: '刀叉勺子', nameEn: 'Cutlery', category: '餐具', categoryEn: 'Tableware' },
      { name: '杯子', nameEn: 'Cups', category: '餐具', categoryEn: 'Tableware' },
      { name: '碗', nameEn: 'Bowls', category: '餐具', categoryEn: 'Tableware' },
      { name: '一次性手套', nameEn: 'Disposable Gloves', category: '餐具', categoryEn: 'Tableware' },
      { name: '饮料水', nameEn: 'Drinks & Water', category: '食物', categoryEn: 'Food' },
      { name: '零食', nameEn: 'Snacks', category: '食物', categoryEn: 'Food' },
      { name: '冰袋', nameEn: 'Ice Packs', category: '食物', categoryEn: 'Food' },
      { name: '毯子', nameEn: 'Blanket', category: '其他', categoryEn: 'Other' },
      { name: '垃圾袋', nameEn: 'Trash Bags', category: '其他', categoryEn: 'Other' },
      { name: '鞋衣服', nameEn: 'Shoes & Clothes', category: '其他', categoryEn: 'Other' },
      { name: '跳绳', nameEn: 'Jump Rope', category: '娱乐', categoryEn: 'Entertainment' },
      { name: '桌游', nameEn: 'Board Games', category: '娱乐', categoryEn: 'Entertainment' },
      { name: '扑克', nameEn: 'Playing Cards', category: '娱乐', categoryEn: 'Entertainment' },
    ],
  },
];

async function seed() {
  console.log('Seeding database...');

  // Delete existing default templates
  await prisma.checklistTemplate.deleteMany({
    where: { isDefault: true },
  });
  console.log('Cleared existing default templates.');

  // Create default templates
  for (const template of defaultTemplates) {
    await prisma.checklistTemplate.create({
      data: {
        name: template.name,
        nameEn: template.nameEn,
        description: template.description,
        descriptionEn: template.descriptionEn,
        icon: template.icon,
        isDefault: true,
        items: {
          create: template.items.map((item, index) => ({
            name: item.name,
            nameEn: item.nameEn,
            category: item.category,
            categoryEn: item.categoryEn,
            orderIndex: index,
          })),
        },
      },
    });
    console.log(`Created template: ${template.name} / ${template.nameEn} (${template.items.length} items)`);
  }

  console.log('Seeding complete!');
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
