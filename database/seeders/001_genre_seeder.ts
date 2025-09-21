import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Genre from '#models/genre'

export default class extends BaseSeeder {
  public async run() {
    const genreNames = [
      'Tipologia di Tecnologia',
      'Ambito',
      'Modello di Business',
      'Target di genere',
      'Target di età',
      'Target di professione',
      'Target geografico',
      'Livello di innovazione',
      'Impegno sociale e ambientale',
    
    ]

    for (const name of genreNames) {
      await Genre.updateOrCreate({ name }, { name })
    }
  }
}

