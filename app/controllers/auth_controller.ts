import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  
  public async register({ request, response }: HttpContext) {
    try {
    const { email, password, full_name } = request.all()
    if (!email || !password || !full_name) {
      return response.status(400).json({ message: 'Missing required fields' })
    }

    const user = await User.create({
      email,
      full_name,
      password
    })
    const token = await User.accessTokens.create(user)  
    return response.status(201).json({ message: 'User created successfully', token })
   } catch (error) {
      return response.status(500).json({ message: 'Internal server error' })
    }
  }


  public async login({ request, response }: HttpContext) {
    try{
    const payload = request.all()
    const email = payload.email
    const password = payload.password

    const user = await User.verifyCredentials(email, password)
    const token = await User.accessTokens.create(user)


    return response.status(200).json({ token, user })
}catch(error){
    if (error.code === 'E_INVALID_CREDENTIALS') {
        return response.status(400).json({ message: 'Credenziali non valide' })
    }
    return response.status(500).json({message: error})
}
}
}