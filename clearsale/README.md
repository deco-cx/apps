To integration with a new api, use this prompt:

based on this documentation
@https://devs.plataformadatatrust.clearsale.com.br/reference/getscores 

0. Review this api inside @client.ts and make sure the typings are correct according to the documentation. Reuse types wherever possible.
1. Create a new loader inside clearsale/loaders/getFraudScore.ts that uses this api to retrieve the score
2. Before retrieving, get the token using ctx.getToken for the bearer auth token