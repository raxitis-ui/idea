import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Filter from '#models/filter'
import Genre from '#models/genre'

export default class extends BaseSeeder {
  public async run() {
    const filters: { genre: string; label: string; slug: string }[] = [
      // Tipologia di Tecnologia
      { genre: 'Tipologia di Tecnologia', label: 'Mobile App', slug: 'mobile_app' },
      { genre: 'Tipologia di Tecnologia', label: 'Web App', slug: 'web_app' },
      { genre: 'Tipologia di Tecnologia', label: 'Hardware', slug: 'hardware' },
      { genre: 'Tipologia di Tecnologia', label: 'Non-technology-based', slug: 'non_tech' },

      // Ambito (Industries)
      { genre: 'Ambito', label: 'Fintech', slug: 'fintech' },
      { genre: 'Ambito', label: 'Healthtech', slug: 'healthtech' },
      { genre: 'Ambito', label: 'Edtech', slug: 'edtech' },
      { genre: 'Ambito', label: 'E-commerce', slug: 'ecommerce' },
      { genre: 'Ambito', label: 'Social', slug: 'social' },
      { genre: 'Ambito', label: 'Entertainment', slug: 'entertainment' },
      { genre: 'Ambito', label: 'Productivity', slug: 'productivity' },
      { genre: 'Ambito', label: 'Sustainability', slug: 'sustainability' },
      { genre: 'Ambito', label: 'Travel', slug: 'travel' },
      { genre: 'Ambito', label: 'Food & Beverage', slug: 'food_beverage' },
      { genre: 'Ambito', label: 'Real Estate', slug: 'real_estate' },
      { genre: 'Ambito', label: 'AI & Machine Learning', slug: 'ai_ml' },
      { genre: 'Ambito', label: 'Blockchain & Cryptocurrency', slug: 'blockchain_crypto' },
      { genre: 'Ambito', label: 'IoT (Internet of Things)', slug: 'iot' },
      { genre: 'Ambito', label: 'AR/VR (Augmented Reality/Virtual Reality)', slug: 'ar_vr' },
      { genre: 'Ambito', label: 'Gaming', slug: 'gaming' },

      // Modello di Business
      { genre: 'Modello di Business', label: 'B2B', slug: 'b2b' },
      { genre: 'Modello di Business', label: 'B2C', slug: 'b2c' },
      { genre: 'Modello di Business', label: 'C2C', slug: 'c2c' },
      { genre: 'Modello di Business', label: 'B2B2C', slug: 'b2b2c' },


      { genre: 'Modello di Revenue', label: 'SaaS', slug: 'saas' },
      { genre: 'Modello di Revenue', label: 'Subscription-based', slug: 'subscription' },
      { genre: 'Modello di Revenue', label: 'Freemium', slug: 'freemium' },
      { genre: 'Modello di Revenue', label: 'Lifetime', slug: 'lifetime' },
      { genre: 'Modello di Revenue', label: 'On-demand', slug: 'on_demand' },


      // Target di genere
      { genre: 'Target di genere', label: 'Maschile', slug: 'male' },
      { genre: 'Target di genere', label: 'Femminile', slug: 'female' },
      { genre: 'Target di genere', label: 'Non-binario', slug: 'non_binary' },

      // Target di età
      { genre: 'Target di età', label: '(0-12)', slug: 'children_0_12' },
      { genre: 'Target di età', label: '(13-17)', slug: 'teenagers_13_17' },
      { genre: 'Target di età', label: '(18-25)', slug: 'youth_18_25' },
      { genre: 'Target di età', label: '(26-40)', slug: 'adults_26_40' },
      { genre: 'Target di età', label: '(41-55)', slug: 'adults_41_55' },
      { genre: 'Target di età', label: '(56-70)', slug: 'adults_56_70' },
      { genre: 'Target di età', label: '(56+)', slug: 'seniors_56' },

      // Target di professione
      { genre: 'Target di professione', label: 'Studenti', slug: 'students' },
      { genre: 'Target di professione', label: 'Professionisti', slug: 'professionals' },
      { genre: 'Target di professione', label: 'Imprenditori', slug: 'entrepreneurs' },
      { genre: 'Target di professione', label: 'Freelance', slug: 'freelance' },
      { genre: 'Target di professione', label: 'Aziende', slug: 'companies' },
      { genre: 'Target di professione', label: 'Enti pubblici', slug: 'public_entities' },
      { genre: 'Target di professione', label: 'Associazioni', slug: 'associations' },

      // Target geografico
      { genre: 'Target geografico', label: 'Nord America', slug: 'north_america' },
      { genre: 'Target geografico', label: 'Europa', slug: 'europe' },
      { genre: 'Target geografico', label: 'Asia', slug: 'asia' },
      { genre: 'Target geografico', label: 'America Latina', slug: 'latin_america' },
      { genre: 'Target geografico', label: 'Africa', slug: 'africa' },
      { genre: 'Target geografico', label: 'Oceania', slug: 'oceania' },

      // Impegno sociale e ambientale
      { genre: 'Impegno sociale e ambientale', label: 'Sostenibilità', slug: 'sustainability' },
      { genre: 'Impegno sociale e ambientale', label: 'Inclusività', slug: 'inclusivity' },
      { genre: 'Impegno sociale e ambientale', label: 'Impatto sociale', slug: 'social_impact' },

      // Tempistiche
      { genre: 'Tempistiche di sviluppo', label: 'Breve periodo 0/3 mesi', slug: 'short_period' },
      { genre: 'Tempistiche di sviluppo', label: 'Medio periodo 3/6 mesi', slug: 'medium_period' },
      { genre: 'Tempistiche di sviluppo', label: 'Lungo periodo 6/12 mesi', slug: 'long_period' },
      


      // Integrazioni esterne
      { genre: 'Integrazioni esterne', label: 'Payments', slug: 'payments' },
      { genre: 'Integrazioni esterne', label: 'Auth', slug: 'auth' },
      { genre: 'Integrazioni esterne', label: 'Analytics', slug: 'analytics' },
      { genre: 'Integrazioni esterne', label: 'AI', slug: 'ai' },
      { genre: 'Integrazioni esterne', label: 'Cloud', slug: 'cloud' },
      { genre: 'Integrazioni esterne', label: 'Database', slug: 'database' },
      { genre: 'Integrazioni esterne', label: 'Email', slug: 'email' },
    ]

    const genreIdByName = new Map<string, number>()

    const genreNames = Array.from(new Set(filters.map((f) => f.genre)))
    for (const genreName of genreNames) {
      const genre = await Genre.updateOrCreate({ name: genreName }, { name: genreName })
      genreIdByName.set(genreName, genre.id)
    }

    for (const item of filters) {
      const genreId = genreIdByName.get(item.genre)
      if (!genreId) continue
      await Filter.updateOrCreate(
        { slug: item.slug, genreId },
        { name: item.label, slug: item.slug, genreId }
      )
    }
  }
}

