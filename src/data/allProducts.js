import { getProductImage } from './productImages';

const generateProducts = () => {
  const categories = [
    { id: 'clothing', name: 'Clothing', icon: '👕' },
    { id: 'toys', name: 'Toys', icon: '🧸' },
    { id: 'feeding', name: 'Feeding', icon: '🍼' },
    { id: 'bath', name: 'Bath & Care', icon: '🛁' },
    { id: 'new', name: 'New Arrivals', icon: '🆕' },
    { id: 'nursery', name: 'Nursery', icon: '🛏️' },
    { id: 'safety', name: 'Safety', icon: '🛡️' },
    { id: 'travel', name: 'Travel', icon: '🚗' },
  ];

  const productNames = {
    clothing: [
      'Organic Cotton Bodysuits', 'Soft Fleece Pajamas', 'Baby Rompers Set', 'Cotton T-Shirts',
      'Baby Denim Overalls', 'Winter Jacket', 'Knit Sweaters', 'Baby Leggings',
      'Summer Dresses', 'Swimwear Set', 'Hooded Towels', 'Baby Socks Pack',
      'Winter Hats & Mittens', 'Baby Vests', 'Footed Pajamas', 'Baby Hoodies',
      'Raincoat Set', 'Baby Jeans', 'Cardigans', 'Onesies Multipack'
    ],
    toys: [
      'Educational Activity Gym', 'Soft Building Blocks', 'Musical Mobile', 'Teething Toys',
      'Baby Play Mat', 'Rattle Set', 'Interactive Books', 'Stacking Rings',
      'Baby Piano', 'Sensory Balls', 'Plush Animals', 'Bath Toys',
      'Push Walker', 'Shape Sorter', 'Learning Tablet', 'Rocking Horse',
      'Baby Gym', 'Toy Cars Set', 'Doll Set', 'Musical Instruments'
    ],
    feeding: [
      'Anti-Colic Bottles', 'Baby Food Maker', 'Bottle Sterilizer', 'Baby Bowls Set',
      'Silicone Bibs', 'Breast Pump', 'Milk Storage Bags', 'Bottle Warmer',
      'Baby Spoons Set', 'Formula Dispenser', 'Sippy Cups', 'High Chair',
      'Breastfeeding Pillow', 'Food Processors', 'Bottle Brushes', 'Milk Powder Container',
      'Snack Cups', 'Thermos Food Jar', 'Placemats', 'Feeding Set'
    ],
    bath: [
      'Baby Shampoo', 'Moisturizing Lotion', 'Baby Oil', 'Bath Thermometer',
      'Hooded Towel Set', 'Baby Washcloths', 'Bath Seat', 'Baby Soap',
      'Diaper Rash Cream', 'Baby Powder', 'Bath Toys Set', 'Baby Brush Set',
      'Nail Clippers', 'Bath Sponge', 'Baby Cologne', 'Bath Caddy',
      'Baby Bath Tub', 'Shower Cap', 'Bath Kneeler', 'Baby Lotion'
    ],
    new: [
      'Smart Baby Monitor', 'Temperature Sensing Bottle', 'Auto-Rocking Bassinet',
      'UV Sterilizer Box', 'Digital Baby Scale', 'Smart Sock Monitor',
      'Wi-Fi Baby Camera', 'Self-Warming Bottle', 'Noise Canceling Earmuffs',
      'Smart Diaper Genie', 'App-Controlled Rocker', 'Baby Sleep Trainer',
      'Portable Sterilizer', 'Digital Thermometer', 'Smart Humidifier',
      'Auto Milk Maker', 'Baby Activity Tracker', 'Smart Night Light',
      'Bluetooth Pacifier', 'Digital Baby Book'
    ],
    nursery: [
      'Baby Crib', 'Changing Table', 'Nursery Glider', 'Baby Dresser',
      'Baby Rocker', 'Nursery Rug', 'Wall Decals', 'Baby Bookshelf',
      'Night Light', 'Sound Machine', 'Humidifier', 'Nursery Curtains',
      'Baby Monitor', 'Crib Mattress', 'Mobile', 'Storage Baskets',
      'Nursery Chair', 'Baby Wardrobe', 'Play Mat', 'Nursery Lamp'
    ],
    safety: [
      'Baby Gate', 'Outlet Covers', 'Corner Guards', 'Cabinet Locks',
      'Safety Rails', 'Baby Proofing Kit', 'Door Stoppers', 'Window Guards',
      'Furniture Anchors', 'Stove Guards', 'Toilet Lock', 'Safety Net',
      'Edge Bumpers', 'Cord Shorteners', 'Drawer Locks', 'Baby Monitor',
      'First Aid Kit', 'Safety Helmet', 'Car Seat', 'Baby Carrier'
    ],
    travel: [
      'Stroller', 'Car Seat', 'Diaper Bag', 'Baby Carrier',
      'Travel Crib', 'Portable High Chair', 'Travel Stroller', 'Car Seat Cover',
      'Travel Bottle Warmer', 'Portable Changing Pad', 'Travel Toy Organizer',
      'Foldable Play Yard', 'Travel Sound Machine', 'Portable Bed Rail',
      'Travel Bottle Brush', 'Compact Stroller', 'Travel Diaper Pail',
      'Portable Baby Bath', 'Travel Sleep Sack', 'On-the-Go Feeding Set'
    ]
  };

  const descriptions = [
    'Premium quality for your little one',
    'Soft and gentle on baby\'s skin',
    'Easy to clean and maintain',
    'Safe and non-toxic materials',
    'Designed for baby\'s comfort',
    'Colorful and engaging design',
    'Helps in baby\'s development',
    'Perfect for everyday use',
    'Parent-approved choice',
    'Award-winning product'
  ];

  let products = [];
  let id = 1;
  let imageIndex = 0;

  // Generate 80+ products (10 per category)
  categories.forEach(category => {
    const categoryProducts = productNames[category.id] || productNames.clothing;
    
    categoryProducts.forEach(productName => {
      const price = Math.floor(Math.random() * 100) + 10;
      const discount = Math.random() > 0.5 ? Math.floor(Math.random() * 30) + 10 : 0;
      const rating = 4 + Math.random();
      const reviews = Math.floor(Math.random() * 500) + 50;
      
      products.push({
        id: id++,
        name: productName,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        price: parseFloat(price.toFixed(2)),
        originalPrice: discount > 0 ? parseFloat((price * 1.3).toFixed(2)) : null,
        discount: discount > 0 ? discount : null,
        image: getProductImage(imageIndex++), // Use real image
        rating: parseFloat(rating.toFixed(1)),
        reviews: reviews,
        category: category.name,
        categoryId: category.id,
        tags: ['New Arrival', 'Best Seller', 'Eco-Friendly'].slice(0, Math.floor(Math.random() * 3) + 1),
        inStock: Math.random() > 0.1, // 90% chance of being in stock
        fastDelivery: Math.random() > 0.3, // 70% chance of fast delivery
      });
    });
  });

  return products;
};

export const allProducts = generateProducts();

export const categories = [
  { id: 'all', name: 'All Products', count: allProducts.length, icon: '🛍️' },
  { id: 'clothing', name: 'Clothing', count: allProducts.filter(p => p.categoryId === 'clothing').length, icon: '👕' },
  { id: 'toys', name: 'Toys', count: allProducts.filter(p => p.categoryId === 'toys').length, icon: '🧸' },
  { id: 'feeding', name: 'Feeding', count: allProducts.filter(p => p.categoryId === 'feeding').length, icon: '🍼' },
  { id: 'bath', name: 'Bath & Care', count: allProducts.filter(p => p.categoryId === 'bath').length, icon: '🛁' },
  { id: 'nursery', name: 'Nursery', count: allProducts.filter(p => p.categoryId === 'nursery').length, icon: '🛏️' },
  { id: 'safety', name: 'Safety', count: allProducts.filter(p => p.categoryId === 'safety').length, icon: '🛡️' },
  { id: 'travel', name: 'Travel', count: allProducts.filter(p => p.categoryId === 'travel').length, icon: '🚗' },
  { id: 'new', name: 'New Arrivals', count: allProducts.filter(p => p.categoryId === 'new').length, icon: '🆕' },
];