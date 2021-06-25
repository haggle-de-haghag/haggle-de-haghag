# Haggle de Haghag

Haggle de Haghag is a web application for playing a board game called Haggle.
* [Haggle (game) - Wikipedia](https://en.wikipedia.org/wiki/Haggle_(game))
* [Haggle | Board Game | BoardGameGeek](https://boardgamegeek.com/boardgame/17529/haggle)

## Try now
https://haggle-de-haghag.osak.jp

## Features
* Create rules and tokens for a Haggle session.
* View and manage the assignment of rules and tokens to players.
* Players can share rules and trade tokens with others.

## Development
1. Start up PostgreSQL container
```sh
docker compose start
```

2. (First time only) Create database tables
```shell
cat db/* | psql -h localhost -p 15432 -U haggle
Password for user haggle: haggle
```

3. Run backend server
```shell
gradle bootRun
```

If you are using IDE such as IntelliJ, you can also run `src/main/java/jp/osak/haggledehaghag/HaggleDeHaghagApplication.kt` as a Spring Boot application.

4. Run frontend server
```shell
cd web
npm install
npm start
```

5. Open http://localhost:3000 in browser.

## Contributing
Feel free to create issues and send pull requests on GitHub.
GitHub issue is also a preferable platform to ask questions, but you can also reach out to me at:
* [@osa_k on Twitter](https://twitter.com/osa_k)
* [@osa_k@social.mikutter.hachune.net on Mastodon](https://social.mikutter.hachune.net/@osa_k)
* Email: osak.63@gmail.com

## License
This project is licensed under the MIT license - See LICENSE for details.