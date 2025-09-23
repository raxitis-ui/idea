/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import IdeasController from '#controllers/ideas_controller'
import AuthController from '#controllers/auth_controller'
import FiltersController from '#controllers/filters_controller'
import { middleware } from './kernel.js'



router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.group(() => {
  //register

  router.post('/register', [AuthController,'register'])

  router.post('/login', [AuthController,'login'])
}).prefix('auth')



router.group(() => {
  router.get('/', [IdeasController, 'index'])
router.get('/search', [IdeasController, 'search'])
router.post('/:id/react', [IdeasController, 'react'])
router.post('/generate', [IdeasController, 'generate'])
router.get('/reactions', [IdeasController, 'reactions'])
}).prefix('ideas').use(middleware.auth({ guards: ['api'] }))

// Filtri pubblici
router.get('/filters/grouped', [FiltersController, 'grouped'])