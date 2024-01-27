import app from "./app.js";
import databaseConnection from "./src/database/dbConnection.js";

databaseConnection()
.then((conn) => {
    app.listen(process.env.PORT || 8000,() => {
        console.log(`Server is running on ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log(`Database Connection failed ${error}`);
})
