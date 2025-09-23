import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Genre from '#models/genre'

export default class extends BaseSeeder {
  public async run() {
    const genreNames = [
      'Tipologia di Tecnologia',
      'Ambito',
      'Modello di Business',
      'Modello di Revenue',
      'Target di genere',
      'Target di età',
      'Target di professione',
      'Target geografico',
      'Impegno sociale e ambientale',
      'Tempistiche di sviluppo',
      'Integrazioni esterne'
    ]

    for (const name of genreNames) {
      await Genre.updateOrCreate({ name }, { name })
    }
  }
}

