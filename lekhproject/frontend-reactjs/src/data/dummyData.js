export const dummyFarmers = [
  {
    id: 1,
    name: 'Ramesh Kumar',
    email: 'ramesh@example.com',
    contact: '+91 98765 43210',
    location: 'Pune, Maharashtra',
    verified: true,
    rating: 4.5,
    totalOrders: 150,
    totalEarnings: 45000,
    status: 'Active',
    profileInfo: 'Organic vegetable farmer with 10+ years experience. Specializes in fresh produce for events.'
  },
  {
    id: 2,
    name: 'Priya Sharma',
    email: 'priya@example.com',
    contact: '+91 87654 32109',
    location: 'Bangalore, Karnataka',
    verified: true,
    rating: 4.8,
    totalOrders: 200,
    totalEarnings: 60000,
    status: 'Active',
    profileInfo: 'Sustainable farming expert. Supplies premium fruits and vegetables for bulk orders.'
  },
  {
    id: 3,
    name: 'Rajesh Patel',
    email: 'rajesh@example.com',
    contact: '+91 76543 21098',
    location: 'Ahmedabad, Gujarat',
    verified: false,
    rating: 4.2,
    totalOrders: 120,
    totalEarnings: 36000,
    status: 'Active',
    profileInfo: 'Family-run farm offering seasonal produce. Perfect for weddings and corporate events.'
  },
  {
    id: 4,
    name: 'Anita Gupta',
    email: 'anita@example.com',
    contact: '+91 65432 10987',
    location: 'Jaipur, Rajasthan',
    verified: true,
    rating: 4.6,
    totalOrders: 180,
    totalEarnings: 54000,
    status: 'Active',
    profileInfo: 'Heritage farmer growing traditional crops. Ideal for cultural events and festivals.'
  }
];

export const dummyConsumers = [
  {
    id: 1,
    name: 'Amit Singh',
    email: 'amit@example.com',
    phone: '+91 98765 43211',
    joinDate: '2023-01-15',
    totalOrders: 25,
    totalSpent: 12500,
    status: 'Active',
    lastLogin: '2024-01-10'
  },
  {
    id: 2,
    name: 'Sneha Reddy',
    email: 'sneha@example.com',
    phone: '+91 87654 32110',
    joinDate: '2023-03-20',
    totalOrders: 18,
    totalSpent: 9500,
    status: 'Active',
    lastLogin: '2024-01-09'
  },
  {
    id: 3,
    name: 'Vikram Joshi',
    email: 'vikram@example.com',
    phone: '+91 76543 21099',
    joinDate: '2023-05-10',
    totalOrders: 32,
    totalSpent: 18000,
    status: 'Active',
    lastLogin: '2024-01-08'
  },
  {
    id: 4,
    name: 'Kavita Nair',
    email: 'kavita@example.com',
    phone: '+91 65432 10988',
    joinDate: '2023-07-05',
    totalOrders: 15,
    totalSpent: 7800,
    status: 'Inactive',
    lastLogin: '2023-12-15'
  }
];

export const dummyOrders = [
  {
    id: 1,
    farmerName: 'Ramesh Kumar',
    farmerLocation: 'Pune, Maharashtra',
    consumerName: 'Amit Singh',
    consumerPhone: '+91 98765 43211',
    items: [
      { name: 'Organic Tomatoes', quantity: 5, price: 50 },
      { name: 'Fresh Carrots', quantity: 3, price: 30 }
    ],
    totalAmount: 315,
    status: 'Delivered',
    date: '2024-01-10',
    paymentStatus: 'Paid'
  },
  {
    id: 2,
    farmerName: 'Priya Sharma',
    farmerLocation: 'Bangalore, Karnataka',
    consumerName: 'Sneha Reddy',
    consumerPhone: '+91 87654 32110',
    items: [
      { name: 'Apples', quantity: 10, price: 120 },
      { name: 'Bananas', quantity: 5, price: 60 }
    ],
    totalAmount: 1320,
    status: 'Processing',
    date: '2024-01-09',
    paymentStatus: 'Paid'
  },
  {
    id: 3,
    farmerName: 'Rajesh Patel',
    farmerLocation: 'Ahmedabad, Gujarat',
    consumerName: 'Vikram Joshi',
    consumerPhone: '+91 76543 21099',
    items: [
      { name: 'Potatoes', quantity: 20, price: 30 },
      { name: 'Onions', quantity: 15, price: 35 }
    ],
    totalAmount: 1275,
    status: 'Shipped',
    date: '2024-01-08',
    paymentStatus: 'Pending'
  },
  {
    id: 4,
    farmerName: 'Anita Gupta',
    farmerLocation: 'Jaipur, Rajasthan',
    consumerName: 'Kavita Nair',
    consumerPhone: '+91 65432 10988',
    items: [
      { name: 'Wheat Flour', quantity: 5, price: 70 }
    ],
    totalAmount: 350,
    status: 'Cancelled',
    date: '2024-01-07',
    paymentStatus: 'Refunded'
  }
];

export const dummyEarnings = {
  totalEarnings: 250000,
  monthlyEarnings: [
    { month: 'Jan 2024', earnings: 45000, orders: 120, growth: 15 },
    { month: 'Dec 2023', earnings: 39000, orders: 105, growth: 12 },
    { month: 'Nov 2023', earnings: 35000, orders: 95, growth: 8 },
    { month: 'Oct 2023', earnings: 32000, orders: 88, growth: 5 }
  ],
  topFarmers: [
    { name: 'Priya Sharma', earnings: 60000, orders: 200 },
    { name: 'Anita Gupta', earnings: 54000, orders: 180 },
    { name: 'Ramesh Kumar', earnings: 45000, orders: 150 },
    { name: 'Rajesh Patel', earnings: 36000, orders: 120 }
  ],
  categoryBreakdown: [
    { category: 'Vegetables', earnings: 120000, percentage: 48 },
    { category: 'Fruits', earnings: 75000, percentage: 30 },
    { category: 'Grains', earnings: 35000, percentage: 14 },
    { category: 'Dairy', earnings: 20000, percentage: 8 }
  ]
};

export const dummyMessages = [
  {
    id: 1,
    recipient: 'Amit Singh',
    recipientId: 1,
    type: 'consumer',
    lastMessage: 'Thank you for the quick delivery!',
    timestamp: '2024-01-10T10:30:00Z',
    unread: 0
  },
  {
    id: 2,
    recipient: 'Priya Sharma',
    recipientId: 2,
    type: 'farmer',
    lastMessage: 'Can I increase my tomato stock?',
    timestamp: '2024-01-09T14:20:00Z',
    unread: 2,
    messages: [
      { id: 1, sender: 'farmer', text: 'Can I increase my tomato stock?', timestamp: '2024-01-09T14:20:00Z' },
      { id: 2, sender: 'admin', text: 'Yes, you can update your inventory in the dashboard.', timestamp: '2024-01-09T14:25:00Z' },
      { id: 3, sender: 'farmer', text: 'Thank you!', timestamp: '2024-01-09T14:30:00Z' }
    ]
  },
  {
    id: 3,
    recipient: 'Rajesh Patel',
    recipientId: 3,
    type: 'farmer',
    lastMessage: 'Verification documents submitted',
    timestamp: '2024-01-08T09:15:00Z',
    unread: 1
  }
];

export const dummyNotifications = [
  {
    id: 1,
    title: 'Low Stock Alert',
    message: 'Tomatoes from Ramesh Kumar are running low (5 kg remaining)',
    type: 'low-stock',
    priority: 'high',
    timestamp: '2024-01-10T08:00:00Z',
    read: false
  },
  {
    id: 2,
    title: 'New Order Received',
    message: 'Order #1234 placed by Amit Singh for ₹315',
    type: 'new-order',
    priority: 'medium',
    timestamp: '2024-01-10T10:30:00Z',
    read: false
  },
  {
    id: 3,
    title: 'Farmer Verification Pending',
    message: 'Rajesh Patel has submitted verification documents',
    type: 'farmer-verification',
    priority: 'medium',
    timestamp: '2024-01-09T14:00:00Z',
    read: true
  },
  {
    id: 4,
    title: 'Payment Received',
    message: 'Payment of ₹1320 received from Sneha Reddy',
    type: 'payment',
    priority: 'low',
    timestamp: '2024-01-09T16:45:00Z',
    read: true
  },
  {
    id: 5,
    title: 'Complaint Received',
    message: 'Complaint from Vikram Joshi regarding order #1233',
    type: 'complaint',
    priority: 'high',
    timestamp: '2024-01-08T11:20:00Z',
    read: false
  }
];
