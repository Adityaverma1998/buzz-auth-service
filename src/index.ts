import { AppDataSource } from "./config/data-source.ts"
import { User } from "./entities/User.ts"

AppDataSource.initialize().then(async () => {

    console.log("Inserting a new user into the database...")
    const user = new User()
    user.firstName = "Timber"
    user.lastName = "Saw"
    // user.age = 25 // age property was removed from User entity
    user.email = "timber@example.com"
    user.provider = "local"
    await AppDataSource.manager.save(user)
    console.log("Saved a new user with id: " + user.id)

    console.log("Loading users from the database...")
    const users = await AppDataSource.manager.find(User)
    console.log("Loaded users: ", users)

    console.log("Here you can setup and run express / fastify / any other framework.")

}).catch((error: unknown) => console.log(error))
