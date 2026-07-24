export type Locale = 'en' | 'id';

export const translations = {
  en: {
    header: {
      home: 'Home',
      about: 'About',
      menu: 'Menu',
      reservations: 'Reservations',
      journal: 'Journal',
      gallery: 'Gallery',
      orderOnline: 'Order Online',
    },
    landing: {
      hero: {
        badge: 'NEMU Space Coffee & Eatery',
        btnOrder: 'Order Now',
        btnReserve: 'Reserve Table',
        defaultBanners: [
          {
            title: 'HANDCRAFTED SPECIALTY CURATIONS',
            subtitle: 'Bringing the harmony of specialty coffee brews, creamy beverages, and curated desserts right to your table.',
            cta_text: 'Order Now',
          },
          {
            title: 'ARTISANAL BREW & CREATIVE LOUNGE',
            subtitle: 'An inspiring collaborative space for creators, culinary lovers, and seekers of aesthetic comfort in the heart of the city.',
            cta_text: 'Reserve Table',
          },
          {
            title: 'FLAVORFUL CULINARY EXPERIENCE',
            subtitle: 'Enjoy the perfect pairing of appetizing main courses, refreshing artisan drinks, and freshly baked pastries.',
            cta_text: 'Explore Catalog',
          },
        ]
      },
      about: {
        badge: 'About NEMU Space',
        points: [
          'High-quality ingredients for our coffee, tea, and culinary menus',
          'Beverages and dishes curated by experienced culinary experts',
          'Warm and interactive service for every guest who visits us',
          'Artistic, comfortable space design that supports productivity',
        ],
        certification: 'Premium Quality & Service',
        certDesc: 'Professional Culinary Team',
        defaultItem: {
          title: 'The Story Behind Every Authentic Serving',
          description: 'NEMU Space started from our love for rich flavors. We believe every dish and beverage—from coffee brews to desserts—has a story worth enjoying in an atmosphere that fosters togetherness.'
        },
        polaroid1: 'Fresh Artisan Pastry',
        polaroid2: 'Universal Beverages',
        badgeTitle: '100%',
        badgeDesc: 'Premium Quality'
      },
      curations: {
        badge: 'Handcrafted Curations',
        title: 'Explore Flavor Categories',
        desc: 'Each of our categories is designed to deliver a unique sensory experience, from the intensity of espresso to the tranquility of selected tea leaf brews.',
        catalogBtn: 'View Full Catalog',
        menuCount: 'Menus',
        defaultCats: [
          { name: 'Single Origin & Manual Brew', desc: 'V60, Japanese Iced, and Aeropress brews from selected grade-A coffee beans.' },
          { name: 'Signature Espresso Brews', desc: 'Exclusive espresso blend mixes with fresh creamy milk and artisan syrup.' },
          { name: 'Artisan Tea & Tisane', desc: 'Organic chamomile, earl grey, and ceremonial grade matcha tea collection.' },
          { name: 'Fresh Pastry & Croissant', desc: 'Artisan toast, butter croissant, and freshly baked side dishes.' },
        ]
      },
      barista: {
        badge: 'Barista Recommends',
        title: 'Crowd Favorites',
        desc: 'A curation of signature menus most loved by our customers. From smooth lattes to decadent artisan desserts.',
        bestSeller: 'Best Seller',
        orderBtn: 'Order Now'
      },
      promotions: {
        badge: 'Special Offers',
        title: 'Exclusive Promos & Benefits',
        desc: 'Enjoy special discounts, member packages, and attractive offers for every coffee moment at NEMU Space.',
        validUntil: 'Valid until',
        claimBtn: 'Claim Promo'
      },
      testimonials: {
        badge: 'Customer Voices',
        title: 'What They Say',
        desc: 'Stories and impressions from regulars who have experienced the warmth of the space and the taste of our coffee.'
      },
      faq: {
        badge: 'Help & Information',
        title: 'Frequently Asked Questions',
        desc: 'Find answers to common questions about our coffee, reservations, and facilities.',
        moreBtn: 'Ask Us Directly'
      }
    },
    hero: {
      subtitle: 'Premium Culinary Experience',
      titleLine1: 'Served For',
      titleLine2: 'Moments That',
      titleHighlight: 'Matter',
      description: 'We craft every dish and beverage with passion, using premium ingredients sourced globally to bring you an unforgettable culinary and sensory ritual.',
      exploreBtn: 'Explore Menu',
      learnBtn: 'Learn More',
      stat1Title: 'Premium Ingredients',
      stat1Desc: 'Carefully sourced from the best local suppliers to ensure optimal flavor.',
      stat2Title: 'Artisanal Craftsmanship',
      stat2Desc: 'Prepared with precision by our experienced culinary team and baristas.',
      stat3Title: 'Fast & Fresh Service',
      stat3Desc: 'Seamless POS & KDS technology ensuring your order is fresh every single time.',
    },
    featured: {
      title: 'Featured Menus',
      items: [
        {
          name: 'Chocolate Fudge Brownie',
          price: '$5.50',
          description: 'Rich chocolate brownie topped with vanilla bean ice cream & espresso drizzle.',
          rating: '4.9',
          image: '/images/brownie.png',
        },
        {
          name: 'Velvet Iced Macchiato',
          price: '$5.20',
          description: 'Layered espresso poured over cold oat milk and Madagascar sweet vanilla.',
          rating: '4.9',
          image: '/images/iced-macchiato.png',
        },
        {
          name: 'Flagship Espresso Beans',
          price: '$14.50',
          description: 'Whole bean 250g bag of our signature dark roast Sumatra & Bali blend.',
          rating: '5.0',
          image: '/images/espresso.png',
        },
        {
          name: 'Caramel Artisan Latte',
          price: '$4.80',
          description: 'Smooth double espresso combined with silky steamed milk & salted caramel.',
          rating: '4.9',
          image: '/images/latte.png',
        },
        {
          name: 'Classic Golden Cappuccino',
          price: '$4.50',
          description: 'Perfect 1:1:1 balance of espresso, hot milk, and dense creamy micro-foam.',
          rating: '4.8',
          image: '/images/cappuccino.png',
        },
        {
          name: 'Butter French Croissant',
          price: '$3.80',
          description: 'Freshly baked flaky butter croissant, crisp golden outside & soft inside.',
          rating: '4.9',
          image: '/images/croissant.png',
        },
      ],
    },
    about: {
      subtitle: 'About Us',
      title: 'Serving Happiness, Every Single Day',
      para1: 'NEMU Space started with a simple belief: a cafe should be a comfortable and inspiring communal space. From our modest origins, we bring together passionate baristas, chefs, and dedicated staff under one unified roof.',
      para2: 'We offer a universal menu—from specialty coffee and creamy milk-based beverages to fresh artisan pastries baked daily. When you step into our space, you are not just grabbing a drink—you are embracing craftsmanship, community, and pure sensory joy.',
      cta: 'Our Journey',
      est: 'Est. 2024',
      company: 'Velvet Brew Co.',
      polaroid1: 'Fresh Pastry & Art',
      polaroid2: 'Universal Drinks',
      polaroid3: 'Cozy Lounge Ritual',
    },
    journey: {
      title: 'Our Journey',
      coldBrewTitle: 'Signature Cold Brew',
      ethicalTitle: 'Ethical Bean Selection',
      v60Badge: 'Precision & Art',
      v60Title: 'The V60 Pour Over Ritual',
      dessertTitle: 'Artisan Desserts',
      bakeryTitle: 'Morning Bakery',
      foamTitle: 'Velvet Micro-Foam',
    },
    testimonials: {
      titleLine1: 'Post Cards From',
      titleLine2: 'Our',
      titleHighlight: 'Regulars',
      cards: [
        {
          author: 'Rina Mahardika',
          role: 'Morning Regular',
          rating: 5,
          quote: 'The best espresso I have ever tasted in the city. The aroma hitting you right as you walk through the door is pure magic. My absolute non-negotiable daily ritual!',
          rotation: 'rotate-[-4deg]',
          bgColor: 'bg-[#F2E5D2]',
        },
        {
          author: 'David Chen',
          role: 'Creative Director',
          rating: 5,
          quote: 'I conduct all my design client consultations at Velvet Brew. The quiet background acoustics, artisan croissants, and friendly baristas make it feel like a second home.',
          rotation: 'rotate-[3deg]',
          bgColor: 'bg-[#EADECA]',
        },
        {
          author: 'Anisa Putri',
          role: 'Coffee Blogger',
          rating: 5,
          quote: 'From their signature Uji Matcha to the slow-pour V60, the consistency across every cup is remarkable. You can tell they care deeply about ethical sourcing.',
          rotation: 'rotate-[-3deg]',
          bgColor: 'bg-[#EADDC8]',
        },
        {
          author: 'Budi Santoso',
          role: 'Entrepreneur',
          rating: 5,
          quote: 'Their POS & KDS ordering system is slick and lightning fast. I can order ahead on my phone during my commute and walk straight to the counter to pick up my hot latte.',
          rotation: 'rotate-[4deg]',
          bgColor: 'bg-[#F0E2CE]',
        },
      ],
    },
    menu: {
      title: 'Menu',
      coffeeCategory: 'Coffee & Beverages',
      coffeeBadge: 'Hot / Iced',
      bakeryCategory: 'Bakery & Desserts',
      bakeryBadge: 'Fresh Daily',
      downloadBtn: 'Download Full PDF Menu',
      coffeeItems: [
        {
          name: 'Single Origin Espresso Shot',
          price: '$3.50',
          description: 'Pure concentrated double shot of our Sumatra & Java dark roast with rich golden crema.',
        },
        {
          name: 'Velvet Caramel Latte',
          price: '$4.80',
          description: 'Silky steamed milk poured over espresso with house-made sea salted caramel drizzle.',
        },
        {
          name: 'Signature Cold Brew',
          price: '$4.50',
          description: 'Steeped for 18 hours in cold filtered water for an ultra-smooth, naturally sweet profile.',
        },
        {
          name: 'Classic Golden Cappuccino',
          price: '$4.50',
          description: 'Equal parts espresso, hot milk, and velvety thick micro-foam dusted with cocoa.',
        },
        {
          name: 'Madagascar Iced Macchiato',
          price: '$5.20',
          description: 'Chilled oat milk and vanilla bean syrup layered underneath freshly pulled espresso.',
        },
        {
          name: 'Ceremonial Uji Matcha Latte',
          price: '$5.00',
          description: 'First-harvest Japanese green tea whisked with steamed milk and organic wildflower honey.',
        },
      ],
      bakeryItems: [
        {
          name: 'Chocolate Fudge Brownie',
          price: '$5.50',
          description: 'Decadent dark chocolate brownie served warm with vanilla ice cream and espresso syrup.',
        },
        {
          name: 'French Butter Croissant',
          price: '$3.80',
          description: 'Traditional 72-layer laminated butter croissant, golden flaky exterior and soft honeycomb core.',
        },
        {
          name: 'Almond Frangipane Pastry',
          price: '$4.20',
          description: 'Flaky pastry filled with sweet almond cream and topped with toasted sliced almonds.',
        },
        {
          name: 'Tiramisu Velvet Slice',
          price: '$6.50',
          description: 'Ladyfingers soaked in our signature cold brew, mascarpone cream, and dark cocoa powder.',
        },
        {
          name: 'Avocado Artisan Toast',
          price: '$7.50',
          description: 'Sourdough toast topped with smashed avocado, cherry tomatoes, and micro-greens.',
        },
        {
          name: 'Grilled Club Sandwich',
          price: '$8.50',
          description: 'Smoked turkey, aged cheddar, crisp lettuce, and cranberry aioli on toasted brioche.',
        },
      ],
    },
    locations: {
      subtitle: 'Visit Us',
      title: 'Our Coffee Shop',
      description: 'Experience the inviting aroma and warm architectural design of our spaces. Whether you need an intimate corner for morning productivity or a communal table for weekend gatherings, our doors are open for you.',
      loungeLabel: 'Flagship Sudirman Lounge',
      barLabel: 'Artisan Espresso Bar',
      monFri: 'Mon - Fri',
      monFriHours: '8:00 AM — 10:00 PM',
      saturday: 'Saturday',
      saturdayHours: '9:00 AM — 11:00 PM',
      sunday: 'Sunday',
      sundayHours: '9:00 AM — 8:00 PM',
      flagshipLabel: 'Flagship Location',
      flagshipAddress: 'Jl. Sudirman No. 123, Central Jakarta',
    },
    contact: {
      title: 'Get In Touch',
      description: 'Have questions about our single-origin roasts, wholesale bean supply, event reservations, or POS/KDS platform? We are always here to connect with fellow coffee connoisseurs.',
      wholesale: 'Wholesale Inquiries',
      events: 'Private Events',
      academy: 'Barista Academy',
      addressLabel: 'Address',
      addressVal: 'Jl. Sudirman No. 123, Central Jakarta',
      phoneLabel: 'Phone',
      phoneVal: '+62 21 555 0123',
      emailLabel: 'Email',
      emailVal: 'hello@velvetbrew.id',
      statusLabel: 'Status',
      statusVal: 'Open Now until 10:00 PM',
    },
    footer: {
      brandDesc: 'We craft every single cup with passion, sourcing sustainable beans from ethical high-altitude farms across the globe to elevate your daily coffee ritual.',
      stayInTouch: 'Stay In Touch',
      newsletterDesc: 'Subscribe to our exclusive newsletter to receive private seasonal roast releases, member discounts, and barista workshop invitations.',
      placeholder: 'Enter your email address...',
      subscribeBtn: 'Subscribe',
      copyright: 'All rights reserved.',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      cookies: 'Cookie Preferences',
    },
  },
  id: {
    header: {
      home: 'Beranda',
      about: 'Tentang',
      menu: 'Menu',
      reservations: 'Reservasi',
      journal: 'Jurnal',
      gallery: 'Galeri',
      orderOnline: 'Pesan Online',
    },
    landing: {
      hero: {
        badge: 'NEMU Space Coffee & Eatery',
        btnOrder: 'Lihat Menu Favorit',
        btnReserve: 'Reservasi Tempat',
        defaultBanners: [
          {
            title: 'Ruang Nyaman, Rasa Berkesan',
            subtitle: 'NEMU Space menghadirkan suasana hangat untuk Anda berbagi cerita, bekerja, atau sekadar bersantai. Nikmati sajian spesial kami dari kopi pilihan hingga hidangan utama yang memanjakan selera.',
            cta_text: 'Lihat Menu Favorit',
          },
          {
            title: 'Lebih Dari Sekadar Tempat Berkumpul',
            subtitle: 'Kami memadukan arsitektur minimalis dengan ragam hidangan premium. Mari rayakan momen kebersamaan di sini.',
            cta_text: 'Reservasi Tempat',
          },
          {
            title: 'Pengalaman Bersantap Terbaik',
            subtitle: 'Manjakan lidah Anda dengan kombinasi hidangan penutup yang manis, minuman yang segar, dan hidangan utama yang memuaskan.',
            cta_text: 'Pesan Sekarang',
          },
        ]
      },
      about: {
        badge: 'Lebih dari Sekadar Tempat Berkumpul',
        points: [
          'Suasana yang tenang dan produktif untuk Work From Cafe.',
          'Pilihan hidangan beragam dari kopi, teh, hingga makanan berat.',
          'Bahan baku premium yang dikurasi langsung oleh tim ahli kami.',
          'Sudut ruangan estetik yang cocok untuk mengabadikan momen.',
          'Pelayanan yang ramah, hangat, dan siap membantu Anda.',
          'Fasilitas lengkap mulai dari koneksi internet cepat hingga area parkir luas.',
        ],
        certification: 'Kualitas, Kenyamanan, Kebersamaan',
        certDesc: 'Nilai Inti NEMU Space',
        defaultItem: {
          title: 'Lebih dari Sekadar Tempat Berkumpul',
          description: 'NEMU Space lahir dari gagasan sederhana: setiap orang membutuhkan ruang di mana mereka bisa sejenak lepas dari rutinitas. Di sini, Anda bebas merayakan momen kecil bersama sahabat, keluarga, atau menikmati waktu luang sendirian ditemani sajian favorit.'
        },
        polaroid1: 'Suasana Nyaman',
        polaroid2: 'Sajian Premium',
        badgeTitle: '100%',
        badgeDesc: 'Pengalaman Terbaik'
      },
      curations: {
        badge: 'Kategori Menu Kami',
        title: 'Jelajahi Pilihan Rasa',
        desc: 'Setiap menu kami dirancang untuk menghadirkan pengalaman sensorik yang unik, menemani setiap momen kebersamaan Anda.',
        catalogBtn: 'Jelajahi Kategori',
        menuCount: 'Kategori',
        defaultCats: [
          { name: 'Coffee', desc: 'Pilihan kopi klasik hingga modern yang diseduh dengan sempurna.' },
          { name: 'Non Coffee', desc: 'Kesegaran minuman artisan tanpa kafein untuk menenangkan hari.' },
          { name: 'Tea', desc: 'Koleksi daun teh pilihan untuk momen bersantai Anda.' },
          { name: 'Matcha', desc: 'Autentik dan creamy, membawa cita rasa khas yang memikat.' },
          { name: 'Chocolate', desc: 'Cokelat pekat premium yang meleleh lembut di setiap tegukan.' },
          { name: 'Mocktail', desc: 'Kreasi minuman segar yang memadukan buah dan sirup artisan.' },
          { name: 'Dessert', desc: 'Penutup manis yang menyempurnakan pengalaman bersantap Anda.' },
          { name: 'Snack', desc: 'Camilan ringan yang cocok menemani waktu mengobrol santai.' },
          { name: 'Main Course', desc: 'Hidangan utama istimewa untuk mengisi kembali energi Anda.' },
          { name: 'Rice Bowl', desc: 'Sajian praktis nan lezat dengan berbagai pilihan lauk.' },
          { name: 'Pasta', desc: 'Klasik, kaya rasa, dan disajikan dengan bahan segar terbaik.' },
          { name: 'Bakery', desc: 'Ragam roti dan pastry yang baru dipanggang setiap hari.' },
          { name: 'Seasonal Menu', desc: 'Kreasi spesial yang hadir khusus menyapa Anda di musim ini.' },
        ]
      },
      barista: {
        badge: 'Menu Favorit',
        title: 'Sajian Pilihan Kami',
        desc: 'Deretan menu unggulan yang selalu menjadi favorit pengunjung. Sempurna untuk menemani waktu luang Anda.',
        bestSeller: 'Menu Pilihan',
        orderBtn: 'Pesan Sekarang'
      },
      promotions: {
        badge: 'Penawaran Spesial',
        title: 'Kejutan Spesial untuk Momen Anda',
        desc: 'Dapatkan penawaran istimewa setiap harinya. Mulai dari paket makan siang hemat hingga potongan khusus untuk member setia NEMU Space.',
        validUntil: 'Berlaku s/d',
        claimBtn: 'Klaim Promo'
      },
      testimonials: {
        badge: 'Suara Pelanggan',
        title: 'Apa Kata Mereka',
        desc: 'Cerita dan pengalaman berkesan dari para pengunjung yang telah menghabiskan waktu di NEMU Space.'
      },
      faq: {
        badge: 'Bantuan & Informasi',
        title: 'Pertanyaan Seputar NEMU',
        desc: 'Temukan jawaban atas pertanyaan umum seputar fasilitas, menu, dan reservasi kami.',
        moreBtn: 'Tanya Kami'
      }
    },
    hero: {
      subtitle: 'Pengalaman Bersantap Terbaik',
      titleLine1: 'Sajian Untuk',
      titleLine2: 'Momen Yang',
      titleHighlight: 'Berkesan',
      description: 'NEMU Space menghadirkan suasana hangat untuk Anda berbagi cerita, bekerja, atau sekadar bersantai. Nikmati sajian spesial kami dari kopi pilihan hingga hidangan utama yang memanjakan selera.',
      exploreBtn: 'Lihat Menu Favorit',
      learnBtn: 'Reservasi Tempat',
      stat1Title: 'Bahan Baku Premium',
      stat1Desc: 'Dikurasi langsung oleh tim ahli kami demi kualitas terbaik.',
      stat2Title: 'Suasana Nyaman',
      stat2Desc: 'Ruang estetik dan tenang, cocok untuk segala aktivitas Anda.',
      stat3Title: 'Pelayanan Ramah',
      stat3Desc: 'Kami selalu menyambut Anda dengan senyuman dan kehangatan.',
    },
    featured: {
      title: 'Menu Spesial Kami',
      items: [
        {
          name: 'Classic Truffle Fries',
          price: 'Rp 35.000',
          description: 'Kentang goreng renyah dengan aroma truffle premium dan taburan keju parmesan.',
          rating: '4.9',
          image: '/images/truffle-fries.png',
        },
        {
          name: 'Signature Creamy Matcha',
          price: 'Rp 42.000',
          description: 'Perpaduan matcha murni dengan susu segar yang menghasilkan tekstur lembut di lidah.',
          rating: '4.9',
          image: '/images/matcha.png',
        },
        {
          name: 'NEMU Platter',
          price: 'Rp 55.000',
          description: 'Pilihan camilan terbaik kami dalam satu piring, cocok untuk dinikmati beramai-ramai.',
          rating: '5.0',
          image: '/images/platter.png',
        },
        {
          name: 'Aromatic Earl Grey Tea',
          price: 'Rp 32.000',
          description: 'Teh hitam klasik dengan sentuhan aroma sitrus yang menenangkan.',
          rating: '4.9',
          image: '/images/earl-grey.png',
        },
      ],
    },
    gallery: {
      title: 'Sudut Nyaman di NEMU Space',
      description: 'Jelajahi setiap sudut ruang kami yang dirancang untuk memberikan ketenangan, inspirasi, dan kenyamanan. Mari abadikan momen terbaik Anda di sini.'
    },
    reservations: {
      title: 'Rencanakan Kedatangan Anda',
      description: 'Jangan biarkan momen berharga Anda terlewatkan. Amankan meja favorit Anda hari ini dan biarkan kami menyiapkan pengalaman bersantap yang tak terlupakan.'
    },
    articles: {
      title: 'Jurnal NEMU Space',
      items: [
        '5 Sudut Ternyaman di NEMU Space untuk Menyelesaikan Pekerjaan Anda',
        'Mengenal Lebih Dekat Perjalanan Rasa: Dari Kebun hingga ke Cangkir',
        'Inspirasi Menu Makan Siang yang Bikin Semangat Balik Lagi',
        'Tren Nongkrong Sehat: Memilih Minuman Artisan Rendah Gula',
        'Cerita di Balik Desain Interior NEMU Space yang Minimalis'
      ]
    },
    about: {
      subtitle: 'Tentang NEMU Space',
      title: 'Menyediakan ruang bagi setiap cerita baru untuk bermula',
      para1: 'NEMU Space lahir dari gagasan sederhana: setiap orang membutuhkan ruang di mana mereka bisa sejenak lepas dari rutinitas. Kami memadukan arsitektur minimalis yang hangat dengan hidangan berkualitas premium.',
      para2: 'Di sini, Anda bebas merayakan momen kecil bersama sahabat, keluarga, atau bahkan menikmati waktu luang sendirian ditemani sajian favorit. Kami berkomitmen untuk selalu menghadirkan pelayanan terbaik dan suasana yang nyaman.',
      cta: 'Lihat Galeri',
      est: 'Est. 2024',
      company: 'NEMU Space',
      polaroid1: 'Suasana Nyaman',
      polaroid2: 'Menu Pilihan',
      polaroid3: 'Momen Berharga',
    },
    journey: {
      title: 'Nilai Brand Kami',
      coldBrewTitle: 'Kualitas Bahan',
      ethicalTitle: 'Kenyamanan Ruang',
      v60Badge: 'Kebersamaan',
      v60Title: 'Merayakan Momen',
      dessertTitle: 'Pelayanan Hangat',
      bakeryTitle: 'Estetika Minimalis',
      foamTitle: 'Inovasi Rasa',
    },
    testimonials: {
      titleLine1: 'Cerita Dari',
      titleLine2: 'Pengunjung',
      titleHighlight: 'Kami',
      cards: [
        {
          author: 'Mahasiswa',
          role: 'Pengunjung Reguler',
          rating: 5,
          quote: 'Tempatnya super nyaman buat nugas! Koneksi internetnya stabil dan makanannya enak-enak banget. Bakal jadi tempat favorit baru.',
          rotation: 'rotate-[-2deg]',
          bgColor: 'bg-[#F2E5D2]',
        },
        {
          author: 'Freelancer',
          role: 'Pekerja Kreatif',
          rating: 5,
          quote: 'Suka banget sama suasana di sini. Pencahayaannya pas dan nggak terlalu berisik. Pas buat meeting santai bareng klien.',
          rotation: 'rotate-[3deg]',
          bgColor: 'bg-[#EADECA]',
        },
        {
          author: 'Ibu Rumah Tangga',
          role: 'Pengunjung Keluarga',
          rating: 5,
          quote: 'NEMU Space cocok buat kumpul keluarga di akhir pekan. Area luas, menu ramah anak, dan pelayanannya sangat cepat tanggap.',
          rotation: 'rotate-[-1deg]',
          bgColor: 'bg-[#EADDC8]',
        },
        {
          author: 'Pekerja Kantoran',
          role: 'Pengunjung Setia',
          rating: 5,
          quote: 'Akhirnya nemu tempat nongkrong yang hidangan utamanya seenak minumannya. Rice bowl-nya juara!',
          rotation: 'rotate-[2deg]',
          bgColor: 'bg-[#F0E2CE]',
        },
        {
          author: 'Content Creator',
          role: 'Kreator',
          rating: 5,
          quote: 'Desain interiornya sangat estetik. Bener-bener tempat yang cocok buat foto-foto sambil nikmatin teh sore.',
          rotation: 'rotate-[-3deg]',
          bgColor: 'bg-[#EADECA]',
        },
        {
          author: 'Anak Muda',
          role: 'Pasangan',
          rating: 5,
          quote: 'Mocktail dan pastry-nya luar biasa segar. Pas banget buat nemenin ngobrol santai bareng pasangan pas weekend.',
          rotation: 'rotate-[1deg]',
          bgColor: 'bg-[#F2E5D2]',
        },
      ],
    },
    faqDetails: [
      { q: 'Apakah NEMU Space menyediakan Wi-Fi?', a: 'Ya, kami menyediakan koneksi Wi-Fi gratis berkecepatan tinggi.' },
      { q: 'Apakah ada area khusus merokok?', a: 'Kami memiliki area semi-outdoor khusus untuk tamu yang merokok.' },
      { q: 'Bisakah saya melakukan reservasi untuk acara privat?', a: 'Tentu, Anda bisa mereservasi sebagian atau seluruh area kami.' },
      { q: 'Apakah menu yang disajikan halal?', a: 'Semua bahan baku dan hidangan yang kami sajikan dijamin halal.' },
      { q: 'Apakah tersedia menu vegan atau vegetarian?', a: 'Kami memiliki beberapa pilihan menu berbahan dasar nabati yang lezat.' },
      { q: 'Bagaimana cara menjadi member NEMU Space?', a: 'Anda bisa mendaftar langsung di kasir atau melalui website kami.' },
      { q: 'Apakah boleh membawa hewan peliharaan?', a: 'Saat ini kami hanya mengizinkan hewan peliharaan di area luar ruangan.' },
      { q: 'Apakah ada batas waktu maksimal untuk duduk?', a: 'Tidak ada batas waktu. Silakan nikmati waktu Anda senyaman mungkin.' },
      { q: 'Apakah menyediakan layanan pesan antar?', a: 'Ya, Anda bisa memesan melalui aplikasi layanan antar favorit Anda.' },
      { q: 'Apakah area parkir memadai?', a: 'Kami menyediakan area parkir yang luas dan aman untuk kendaraan roda dua maupun empat.' }
    ],
    menu: {
      title: 'Daftar Menu',
      coffeeCategory: 'Minuman Kopi & Teh',
      coffeeBadge: 'Segar & Menenangkan',
      bakeryCategory: 'Makanan & Camilan',
      bakeryBadge: 'Lezat & Menggugah Selera',
      downloadBtn: 'Lihat Semua Menu',
      coffeeItems: [],
      bakeryItems: [],
    },
    locations: {
      subtitle: 'Temukan Kami',
      title: 'Lokasi NEMU Space',
      description: 'Rasakan kehangatan suasana dan desain arsitektur estetik di ruang kami. Apakah Anda membutuhkan sudut nyaman untuk bekerja di pagi hari atau meja komunal di akhir pekan, pintu kami selalu terbuka untuk Anda.',
      loungeLabel: 'Area Komunal & Terbuka',
      barLabel: 'Ruang Bersantap & Diskusi',
      monFri: 'Senin - Jumat',
      monFriHours: '08.00 — 22.00 WIB',
      saturday: 'Sabtu',
      saturdayHours: '09.00 — 23.00 WIB',
      sunday: 'Minggu',
      sundayHours: '09.00 — 22.00 WIB',
      flagshipLabel: 'Lokasi Utama',
      flagshipAddress: 'Jl. Sudirman No. 123, Jakarta Pusat',
    },
    contact: {
      title: 'Mari Terhubung',
      description: 'Kami selalu senang mendengar cerita dan masukan dari Anda. Jangan ragu untuk menghubungi tim kami melalui kontak di bawah ini.',
      wholesale: 'Kemitraan & Kolaborasi',
      events: 'Acara Privat',
      academy: 'Karir',
      addressLabel: 'Alamat',
      addressVal: 'Jl. Sudirman No. 123, Jakarta Pusat',
      phoneLabel: 'Telepon',
      phoneVal: '+62 21 555 0123',
      emailLabel: 'Email',
      emailVal: 'hello@nemuspace.id',
      statusLabel: 'Status Operasional',
      statusVal: 'Buka Sekarang hingga 22.00 WIB',
    },
    footer: {
      brandDesc: 'NEMU Space adalah rumah kedua bagi Anda untuk berkumpul, bekerja, dan merayakan kebersamaan ditemani ragam hidangan premium.',
      stayInTouch: 'Tetap Terhubung',
      newsletterDesc: 'Berlangganan buletin eksklusif kami untuk mendapatkan info promo terbaru, penawaran khusus member, dan undangan acara spesial.',
      placeholder: 'Masukkan alamat email Anda...',
      subscribeBtn: 'Berlangganan',
      copyright: 'Hak cipta dilindungi undang-undang.',
      privacy: 'Kebijakan Privasi',
      terms: 'Syarat & Ketentuan',
      cookies: 'Preferensi Cookie',
    },
    emptyState: {
      noMenu: 'Belum ada menu yang ditambahkan.',
      noPromo: 'Saat ini belum ada promo yang tersedia.',
      noArticle: 'Artikel belum tersedia untuk saat ini.',
      noGallery: 'Galeri masih kosong.',
      reserveSuccess: 'Reservasi Anda berhasil dikonfirmasi!',
      reserveFailed: 'Maaf, reservasi gagal diproses. Silakan coba lagi.',
      notFound: 'Data yang Anda cari tidak ditemukan.',
      error: 'Ups, terjadi kesalahan pada sistem kami.',
      noSearch: 'Tidak ada hasil pencarian yang cocok.'
    },
    cta: {
      viewMenu: 'Lihat Menu Favorit',
      reserve: 'Reservasi Tempat',
      order: 'Pesan Sekarang',
      readMore: 'Baca Selengkapnya',
      contact: 'Hubungi Kami',
      registerMember: 'Daftar Member',
      claimPromo: 'Klaim Promo',
      viewGallery: 'Lihat Galeri',
      searchMenu: 'Cari Menu',
      sendMessage: 'Kirim Pesan',
      subscribe: 'Berlangganan',
      exploreCategory: 'Jelajahi Kategori',
      viewDetails: 'Lihat Detail',
      saveArticle: 'Simpan Artikel',
      buyNow: 'Beli Sekarang',
      backHome: 'Kembali ke Beranda',
      findLocation: 'Temukan Lokasi',
      askUs: 'Tanya Kami',
      viewAllPromos: 'Lihat Semua Promo',
      tryNewMenu: 'Coba Menu Baru'
    },
    microcopy: {
      button: {
        save: 'Simpan',
        cancel: 'Batal',
        apply: 'Terapkan',
        submit: 'Kirim',
        login: 'Masuk',
        register: 'Daftar',
        next: 'Lanjut',
        delete: 'Hapus'
      },
      form: {
        namePlaceholder: 'Masukkan nama lengkap Anda',
        emailPlaceholder: 'Alamat email yang valid',
        phonePlaceholder: 'Nomor telepon aktif',
        datePlaceholder: 'Pilih tanggal kedatangan'
      },
      search: {
        placeholder: 'Cari menu, artikel, atau promo...'
      },
      auth: {
        welcomeBack: 'Selamat datang kembali',
        passwordPlaceholder: 'Masukkan kata sandi Anda'
      },
      dashboard: {
        summary: 'Ringkasan hari ini',
        activeOrders: 'Total pesanan aktif'
      },
      reservation: {
        selectTable: 'Pilih meja yang tersedia',
        confirmDetails: 'Konfirmasi detail reservasi'
      },
      pos: {
        addToCart: 'Tambahkan ke keranjang',
        checkout: 'Selesaikan pembayaran'
      },
      inventory: {
        remainingStock: 'Sisa stok saat ini',
        updateStock: 'Perbarui jumlah barang'
      },
      cms: {
        publish: 'Publikasikan konten',
        saveDraft: 'Simpan sebagai draf'
      }
    }
  },
};
