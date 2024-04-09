## Preparativos

(Nenhum passo dessa etapa impacta a sua loja atual em produção)

Veja como preparar sua loja deco.cx para o Go Live com VTEX.

<details><summary> 1º - Criar o domínio {decoSite}.deco.site </summary><p> Na <a href="https://admin.deco.cx/sites/${decoSite}" target="_blank"> página inicial </a> do seu painel na deco.cx. </p><p>Clique em "Criar domínio deco.site".</p><img src="https://github.com/deco-cx/apps/assets/76620866/fb13de92-6ba9-4a94-bd97-560360ed125f"><p> Caso esse botão não esteja disponível para você, peça ao admnistrador do site ou no canal deco-ajuda do discord. </p></details>

<details><summary> 2º - Adicionar os domínios a VTEX </summary><p> Nessa etapa, adicione os seguintes domínios na lista de domínios VTEX. </p><ul><li>- {decoSite}.deco.site</li><li>- secure.{withoutSubDomain}</li></ul><p> Para adicionar domínios na VTEX, entre <a href="https://${account}.myvtex.com/admin/account/stores/" target="_blank"> nessa página </a>. </p></details>

<details><summary> 3º - Fazer o apontamento do domínio secure.{withoutSubDomain} </summary><p> No seu serviço de hospedagem, defina o CNAME para o subdomínio secure. </p><p>Content: secure.{withoutSubDomain}.cdn.vtex.com</p></details>

<details><summary> 4º - Preencher o publicUrl da sua App </summary><p> Na sua App, preencha o campo publicUrl com o domínio secure da sua loja. <span>(Form a esquerda)</span></p></details>

## Go Live

Antes de fazer o Go Live, garanta que o seu site está aprovado em todos os
pontos da planilha de QA.

<details><summary> 1º - Adicionando o domínio na deco </summary><p> No painel da deco.cx, em <a href="https://admin.deco.cx/sites/${decoSite}/settings" target="_blank"> configurações </a>, clique em adicionar domínio existente. </p><p>Esse modal deve aparecer:</p><img src="https://github.com/deco-cx/apps/assets/76620866/0c2e39a6-4214-4e1d-86fb-0a31070260f7"><p>Clique em Adicionar</p></details>

<details><summary> 2º - Apontando o domíno para a deco </summary><p> No seu serviço de hospedagem, defina o CNAME do domínio que deseja fazer o Go Live, sendo a URL deco.site. </p><p>Content: {decoSite}.deco.site</p></details>

<details><summary> 3º - Validando o domínio </summary><p>Novamente painel da deco.cx, em configurações.</p><p> Clique nos 3 pontinhos na linha do domínio que deseja validar. </p><p>Depois, clique em Setup.</p><p>Por último, clique em Validate.</p><p> Se tudo estiver certo, o domínio deve ser validado e você poderá acessá-lo em alguns minutos. </p></details>
