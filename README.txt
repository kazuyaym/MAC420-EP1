Marcos Kazuya Yamazaki
EP1 - MAC420 Introcução a Computação Gráfica

Neste EP foi implementado a função de carregar novos objetos no canvas, carregando um arquivo .obj com os locais dos vértices de um objeto e os vertice de cada face, dentro do arquivo objReader.js, basicamente o que ele faz, é criar tipo uma estrutura com arrays onde serão guardadas informações retiradas do arquivo .obj que será lido linha por linha, por padrão meu programa reconhece quando a linha começa com v, vn ou f, assim, guarda seus proximos 3 numeros flutuantes nos arrays.
Ao mesmo tempo que estamos lendo todos os vertices, localizaremos as maiores e menores coordenadas de cada eixo, x,y e z, afim de tirar a diferença para que possamos centralizar o objeto mais adiante. Essas diferenças estao sendo guardadas nas variáveis diffx, diffy e diffz.

Após isso, ao voltar para o arquivo objViewer.js para cada vértice é feita a alteração para que o objeto possa ficar centralizado

O programa diferencia como as faces estavam sendo guardadas:
objTipo pode ter valores: 0, se o arquivo .obj não especifica nenhuma vertice normal com nenhuma face e/ou vertice
                          1, se o arquivo .obj está guardando suas faces no modo f v//vn v//vn v//vn 
                          2, se o arquivo .obj está guardando suas faces no modo f v/vt/vn v/vt/vn v/vt/vn 
Se objTipo for igual a 1 ou 2, isso quer dizer que os vertices normais foram dadas, mas ainda era preciso saber se esses vertices normais estavam sendo calculados no modo flat ou smooth. O que foi verificado e os novos vertices normais calculados.
Com isso temos dois arrays guardando vertices normais, mas cada um para o seu modo, e quando mudamos o modo no browser, a unica coisa que o programa faz, é passar os vertices normais da opção desejada.