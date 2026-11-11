---
alvo: uo-classic
status: aprovado
niveis_aprovados: [N0, N1]
classe: C1
confidencial: nao
aprovado_por: responsável, na conversa
data: 2026-10-26
---

# Protocolo de segurança — Ultima Online Classic (uo-classic)

## 1. Identificação

| Campo | Valor |
|---|---|
| Alvo | Instalação do Ultima Online Classic (EA/Mythic) no PC do responsável. Na triagem, a instalação tem **só o bootstrap do patcher**: `UO.exe` (Bioware Patch Client 1.0.6.5), a DLL de Game Explorer e as configurações. O cliente do jogo (`client.exe`) e os dados (`.mul`/`.uop`) **não estão instalados**, porque o patcher nunca rodou |
| Local de origem | `G:\Games\Electronic Arts\Ultima Online Classic` (instalado em 2026-10-15, segundo o registro do Windows e as datas dos arquivos do instalador) |
| Local da cópia | `alvos/uo-classic/instalacao/` (fora do git) |
| Origem | Instalador do site oficial (uo.com/EA), segundo o responsável |
| Objetivo da análise | Nesta etapa, só o patcher: (1) formato da configuração e do manifesto que ele consome; (2) como descobre, baixa e confere os arquivos do cliente (repositórios, módulos, verificação de integridade); (3) o que ele grava no disco e no registro. O cliente e os dados entram depois, por nova triagem, quando o responsável rodar o patcher por conta própria |
| Autorização | Cópia própria do responsável, análise local e estática. Os termos da EA restringem a engenharia reversa (seção "Termos de uso"); o responsável aceitou o risco formal para N0 e N1 |
| Confidencial | Não |

## 2. Triagem passiva

Feita em 2026-10-26, só leitura, sem executar nada do jogo.

| Verificação | Resultado |
|---|---|
| SHA-256 | Tabela "Arquivos" abaixo |
| Tipo real × extensão | Bate em todos: 3 PE (`MZ`), PNG, atalho `.lnk`, XML UTF-16 (`.mcl`) e 2 textos (`.cfg`) |
| Tamanho e conteúdo | 8 arquivos, 0,9 MB, 1 subpasta (`GDF/`). Nenhum compactado |
| Assinatura | `UO.exe`: Authenticode **válida**, emissor "Electronic Arts, Inc." (certificado com validade até 2013-10-18, com carimbo de tempo). `UOClassicGDF.dll` e `uninstUOClassic.exe`: sem assinatura |
| Antivírus local | Microsoft Defender (`MpCmdRun -ScanType 3`) na pasta inteira, em 2026-10-26: nenhuma ameaça |
| Reputação externa | Não consultada |
| Sinais de alerta | Nenhum forte. Notas: (a) o patcher baixa por **HTTP sem TLS** (`http://patch.uo.eamythic.com/uopatch-sa/legacyrelease/...`); (b) a DLL de Game Explorer e o desinstalador NSIS não têm assinatura, o que é comum nesse tipo de arquivo; (c) a seção `.rsrc` da DLL tem entropia 7,39, explicada pelas miniaturas PNG do Game Definition File |

**Classe de confiança:** C1. A origem é oficial, o executável principal tem assinatura EA válida, o scan veio limpo e não há sinal de alerta forte.

### Arquivos

| Arquivo | Bytes | SHA-256 | Copiado |
|---|---|---|---|
| `UO.exe` | 583256 | `422C8FBBBE2105C4486BEA88C9A6DEA27A0E07D233EBD96F3F659143F3D83417` | sim |
| `GDF/UOClassicGDF.dll` | 221184 | `918766CA41C4D7A39980AFB3AE7C3360E3646FF0583F86283194B22FADA8AAA6` | sim |
| `UO-patch.cfg` | 798 | `317CD313D3C78617C0A0F305757CBF452388B8CFA90EBDD2D0B1126F1780EDD1` | sim |
| `Uo.cfg` | 612 | `DCA109AF7AD7F8AFD15124A7659F858E21424803844D4FC0A7B5989082D3845A` | sim |
| `uninstUOClassic.exe` | 86294 | `43DD289F91A75D41013D8147B8D761E7C7B9A68B19162423DFEA86C51CDF843A` | não: desinstalador NSIS genérico, fora do objetivo |
| `GDF/UO-MCE.lnk` | 933 | `D2CCF1C36C032921B653E6242C4BF9001EC6C62F07157670E106D1EA626E50A9` | não: atalho com caminhos e metadados da máquina local |
| `GDF/UO-MCE.mcl` | 1084 | `492DA76ACE2A3DADD49D2BADF60464004299F014A6C34B693C7A8145117CD4A9` | não: descritor do Media Center com caminhos locais |
| `GDF/UO-MCE.png` | 67882 | `9BCE6F6A93D0815BEDF9CD85904302DA604405A3B7860E3FAED59C0EFAC9042E` | não: imagem (asset), fora do objetivo |

Cópia: 4 arquivos, 805850 bytes, SHA-256 de cada cópia igual ao da origem.

### Engine e proteção

- **Não é Unity.** Não há `UnityPlayer.dll`, `<Jogo>_Data/` nem `GameAssembly.dll`, e não há string de Unity ou mono nos binários. A marcação "Unity no PC" do questionário não se confirma.
- **O patcher é nativo Win32 x86** (PE32, máquina `0x14C`, subsistema GUI), compilado com MSVC: seções `.text`, `.rdata`, `.data` e `.rsrc`, data de link 2012-02-27. Recursos de versão: "Bioware, an EA Studio", "Bioware Patch Client", 1.0.6.5. Imports de rede via WinHTTP.
- **O cliente do jogo não está na máquina**, então a engine dele não pôde ser confirmada pelos arquivos. Segundo conhecimento público, é um cliente nativo C++ 2D, mas isso fica como **hipótese** até a triagem do cliente.
- **Anti-cheat, packer, DRM:** nenhum encontrado. Não há módulo ou string de EasyAntiCheat, BattlEye, nProtect/GameGuard, XIGNCODE, Themida, VMProtect ou UPX. As seções são as padrão do compilador, a entropia é normal (`.text` 6,57) e os 5720 bytes de overlay do `UO.exe` são a assinatura Authenticode. `IsDebuggerPresent` aparece uma vez em cada PE, o padrão do runtime do MSVC.

### Dados pessoais e da conta

- `Uo.cfg`: `SavePassword=off` e `Password=` vazio. Não há usuário nem conta.
- Não existem logs do patcher (a configuração prevê `patcher*.log` na pasta da instalação), nem pasta de personagens ou de macros.
- Também não existem pastas do UO em `Documents`, `AppData\Local`, `AppData\Roaming` ou `Program Files`.
- Registro do Windows: só o caminho de instalação, o executável, o GUID do Game Explorer e a entrada de desinstalação.
- Nenhum dado da conta foi encontrado. O `.lnk` e o `.mcl` (metadados da máquina) ficaram fora da cópia.
- Regra para a próxima etapa: quando o cliente for baixado e o jogo usado, os logs, as pastas de personagens e macros e as configurações com login **ficam fora de `alvos/` e de qualquer registro**.

## 3. Plano de processos

| Nível | Necessário para | Processos | Risco | Mitigação |
|---|---|---|---|---|
| N0 | Evidência, registro de lacunas, leitura de documentação da comunidade (formatos e protocolo do UO, emuladores e clientes abertos como fontes de hipótese) | Servidor REA; navegador embutido para leitura | Baixo. Fonte de comunidade pode estar errada ou citar código vazado | Tratar como hipótese a confirmar no binário. Não usar código-fonte vazado da EA |
| N1 | Ler o `UO.exe` e a DLL: imports, strings, recursos, funções de leitura do `UO-patch.cfg`, do manifesto e da verificação | REA (`binary_overview`, `inspect_*`, `list_strings`, `search_*`); Ghidra headless/GUI (JVM, JDK 21) com GhidraMCP; projeto do Ghidra em `saidas/uo-classic/ghidra/` | Baixo. Nada executa e nada vai para a rede ou para a EA. Risco formal: §2 dos termos | Só a cópia em `alvos/uo-classic/`. No repositório público, trechos curtos e paráfrase; pseudocódigo extenso fica em `saidas/` |
| N2 | **Não aprovado** | — | Rodar o jogo ou o patcher ligado ao servidor oficial (§7C dos termos: monitoramento e coleta de dados de programas de terceiros) | Fora do plano. Só por adendo, caso a caso, e de preferência nunca |
| N3, N4a, N4b | **Não aprovados** | — | Execução, injeção, depurador, Cheat Engine, captura de rede contra o servidor oficial: risco de banimento e de violar a §7C | Fora do plano. Não se aplicam a este alvo |

### Fora da sessão (ação do responsável, não do REA)

Rodar o patcher para baixar o cliente é **uso normal do produto pelo responsável**, feito por ele, fora desta sessão. Não é uma etapa da análise. Antes de rodar, ele deve considerar dois pontos:

- O download é feito por HTTP sem TLS. A integridade depende do que o manifesto confere, e isso é justamente uma das perguntas desta análise.
- Os arquivos baixados abrem uma **nova triagem**, porque são artefatos novos do mesmo alvo: hashes, engine do cliente e proteção.

### Pilha de ferramentas proposta (engine nativa x86)

Base: `docs/plano-integracao-games.md` e `docs/conhecimento-universal-modder.md`, camada "Nativo / C++".

| Ferramenta | Situação | Nível | Uso aqui |
|---|---|---|---|
| REA 6.4.0 (tools nativas de PE) | Instalado, auditado, no gate (`rea-niveis.json`) | N0/N1 | Visão geral, imports, recursos, assinatura, strings, evidência |
| Ghidra (`%LOCALAPPDATA%\ghidra`) + JDK 21 (Microsoft 21.0.12) | Instalados | N1 | Descompilação do patcher; depois, do cliente |
| GhidraMCP 2.0 (commit `1e98025`), MCP `ghidra` | Instalado, no gate (`ghidra-niveis.json`, todas as tools em N1) | N1 | Navegação e anotação pelo agente |
| universal-modder (`ferramentas/`, `5ba8150`) | Clonado, só texto | N0 | Método nativo (strings → imports → xrefs). Não tem nota sobre o UO |
| Documentação da comunidade (formatos `.mul`/`.uop`, protocolo, clientes e emuladores de código aberto) | Leitura web, sem instalar | N0 | Hipóteses de formato, a confirmar no binário |
| Leitor dos formatos de dados do cliente (por exemplo, UOFiddler, ou um parser próprio a partir da documentação) | **Não instalado; só na etapa do cliente** | N1 | Entra por adendo, auditado, fixado e registrado no gate, se o cliente for baixado |
| Cpp2IL, UnityPy, AssetRipper, UE4SS, FModel | Não se aplicam | — | A engine não é Unity nem Unreal |
| Cheat Engine, x64dbg, RenderDoc ao vivo, captura de rede | Fora do plano | N3 | Jogo online com servidor oficial. Não instalar para este alvo |

Nenhuma ferramenta nova é instalada nesta unidade.

## 4. Isolamento

- Conectores sensíveis: os 10 conectores do claude.ai foram desligados pelo toggle da sessão no início da unidade.
- Rede durante a execução: n/a, porque nada do alvo é executado.
- Ambiente: host, só análise estática da cópia em `alvos/uo-classic/`.
- Navegador: n/a, sem N3.
- Servidor local do alvo: n/a.
- Saídas em `saidas/uo-classic/` (fora do git). Se aparecer um segredo (chave, token ou credencial de serviço), ele não vai para registro, commit nem busca.

## 5. Procedimentos

- Aplicados: nenhum (o índice de `procedimentos/` está vazio).
- Criados neste protocolo: nenhum. O risco novo deste alvo (jogo online com servidor oficial e termos restritivos) ficou coberto pelo plano: N2+ fora e mais nada. Se o padrão se repetir em outro alvo, vale propor um procedimento "jogo online com servidor oficial".

## Termos de uso (avaliação para a decisão do responsável)

Fonte: EA User Agreement, "Last Updated: May 14, 2026" (tos.ea.com, lido em 2026-10-26). Resumo próprio, não é parecer jurídico:

- **§2 Licença:** proíbe engenharia reversa e extração de código ou dados, salvo autorização expressa da EA ou permissão legal ("unless expressly authorized by EA or permitted by law").
- **§13B:** para residentes no Brasil, o contrato é com a EA Swiss Sàrl e vale a lei do país de residência.
- **Lei 9.609/98 (software):** não identificamos uma exceção expressa de descompilação para interoperabilidade, como a da diretiva europeia. A análise não se apoia nessa permissão.
- **§7A:** contornar medidas de proteção encerra a licença. Não há medida de proteção no que foi analisado, e o plano não contorna nada.
- **§7C:** ao rodar um jogo online, o anti-cheat ou monitoramento pode coletar dados de "programas de terceiros não autorizados", inclusive os que coletam informação do jogo. Isso pesa contra N2 e N3.
- **Risco para N0 e N1:** formal e contratual (§2). Nada executa, nada vai para a EA e não há conta envolvida, então o risco prático de sanção na conta é muito baixo. Publicar código descompilado extenso aumentaria o risco, e as regras do repositório já proíbem isso.
- **Risco para N2 e N3:** real, de suspensão ou banimento da conta (§6, §7C, §8), além do contratual. Ficam fora do plano.
- **Regra do plano de integração:** a regra "só single-player ou offline" de `docs/plano-integracao-games.md` não é atendida, porque o UO é online. O responsável aceitou uma **exceção restrita à análise estática** (N0 e N1).

## 6. Decisão

**Aprovado**, com níveis N0 e N1, pelo responsável, na conversa, em 2026-10-26. O responsável:

- confirmou a origem oficial (uo.com/EA);
- escolheu o escopo "patcher agora, cliente depois", com nova triagem quando o cliente for baixado por ele, fora da sessão;
- aceitou a exceção estática à regra só-offline e o risco formal da §2 dos termos.

N2, N3 e N4 não foram aprovados.

## 8. Identidade dos arquivos

<!-- O gate (MEL-06a) confere o SHA-256 de cada arquivo admitido de alvos/<slug>/ contra esta tabela: arquivo fora dela, hash divergente, hash incompleto, caminho repetido com outro hash, seção ausente ou repetida bloqueiam. Uma linha por arquivo copiado para alvos/<slug>/, caminho relativo a essa pasta (com "/"), hash completo (64 hex) medido na triagem. Uma tool que recebe um diretório confere cada arquivo dele. Arquivo novo só entra por adendo aprovado. Saídas em saidas/<slug>/ não entram aqui. -->

Seção acrescentada em 2026-11-10 pela migração MEL-06a-m (Adendo 3, abaixo). Os hashes são os da triagem: de 2026-10-26 para `instalacao/` (seção 2) e de 2026-10-28 para `cliente/` (Adendos 1 e 2). Foram conferidos com os arquivos atuais antes do registro. A numeração segue o modelo; este registro não tem seção 7.

| Arquivo | SHA-256 |
|---|---|
| `cliente/Anim1.def` | `40348b160303bf1accf2b2fa795741bff516e818c5688d6550f0a6078b2b2236` |
| `cliente/Anim2.def` | `e47d04fabc7446a8866fb9369bda2b18bc7fddab3d87e49e39c1527b7b7d6774` |
| `cliente/anim6.idx` | `95d7f8a09aace7f1da7e489ed27058e9b988de8aad630351f266e24670f8374b` |
| `cliente/anim6.mul` | `918976721e944c73109cc50b6ee4e35adcbc46428bbbe5edd402a184c22cec1d` |
| `cliente/AnimationFrame6.uop` | `d6475b662bb1ec7b8334f51562207434486ef95c1791628fb2b69d1359132ac6` |
| `cliente/AnimationSequence.uop` | `0651d15b248bb540d16514bf1f76c5fd3e4b1f84a487ae5b79a86182b09711b9` |
| `cliente/animdata.mul` | `70191185ee77435040a9841cf227365d95a31b99903cd61b5597c5ad2562d371` |
| `cliente/animinfo.mul` | `c6ab4c1d615a638221fd1f81e5d31db34820a1cfb8ef18c1c5b4e1c3554c434a` |
| `cliente/art.def` | `9cd4dc579cb66ee26e10c3713332a607e061c047c0781958eca0d678886faa48` |
| `cliente/Arttable.cfg` | `0ae58cbaa93c4715d43499c322af55e6f7fc32517369ea73c9cc7a21477669ef` |
| `cliente/Blueprints.tbp` | `916eb661152b25c6a0eb52b838eb3340ade9f02d849e46f49c011ee297cb9c36` |
| `cliente/Body.def` | `2fbd408fcc96d1c0b382c4fd5c4efc798e2e5093e59a14ed6be9146b4a81cdab` |
| `cliente/Bodyconv.def` | `d86b9fe825ed55185bd4a0206d5534d7db3bba22f9e57909847c9c10d14d5da1` |
| `cliente/Chat.enu` | `efe99ac3846002bb20058b37a18d2ced3923ce67b213015b803c0ccb4f362f06` |
| `cliente/client.exe` | `6eefcdc345fcfd54da00d63045b5b753d51ecd8b90e30c414fcf14a6f5929b80` |
| `cliente/client_beta.exe` | `ae4eb4e186cfae690234706fcae08e36112c8b9e3d4189f0a299e66bbae5c0ba` |
| `cliente/client_tc.exe` | `6507e703b0ae65fa7ba174f53f86317ac3b736f0b12c1a8e86240b4cb03b5146` |
| `cliente/ClientPicker.exe` | `d55a83372238428f0a839279e5d332302fbf6f28f7857bbb15427874958905a5` |
| `cliente/Cliloc.enu` | `e381fc6b782e986ed08c909f7b51cd2af66051a7a1e20d40c4e0780a6ae7dc16` |
| `cliente/Corpse.def` | `9bc572c3643acbcd1e299e6def4297c57da586624e373a45da88f72654b7c02a` |
| `cliente/Credits.dat` | `c7e70e6a1fb652790b2809de3508fae146c7ab9f1a481e5e5f8e9ae547000497` |
| `cliente/Data/assetmap.xml` | `902b0a3f1c1cff66d57c31dc74f34494d7979f97b25f59b603963b66e7541de5` |
| `cliente/Default.mac` | `5f1cd206ef351fbafecb6cec1239ebfd0007932bddbacea8fdcf88a0d1bb1553` |
| `cliente/doors.txt` | `eaef95839e2bf7b75e7e82891996eaba982e402345b1507f524c01e18a702334` |
| `cliente/Equipconv.def` | `ee650d81d88205745958cc6b6adf0c1f656f294dd0e97d58716e95142a2243ff` |
| `cliente/facet00.mul` | `14c496f799aeae6cf2366e7583a2fe052b10a2d5372a75c3e7b32fad860bc5f0` |
| `cliente/facet01.mul` | `89f5eb34350b671978decd8d399eb07fc2bc5033c90548825534be81405f1c7e` |
| `cliente/facet02.mul` | `69a9af0750ad884a1c0893556cd4ed4aba3208ae43e40b8a8641bd42e8b059d6` |
| `cliente/facet03.mul` | `c5e0f80d316eb6616c4865b853581a613b666da1f15c2fa43bb0f95165c58b15` |
| `cliente/facet04.mul` | `09609bb4459519fc58d75b78246a606aa59e13c2957f136a1faca986b53ebc7b` |
| `cliente/facet05.mul` | `e659d00439940b482704c30153f6f47cf1347b42ec60bfbcec61b62831590515` |
| `cliente/floors.txt` | `4ce9866766583f947365120ba7bd2cde304b4add6668bf4cf9667e27d94c6f1b` |
| `cliente/gamegen.txt` | `04573bda88f391b42f3035828bcb00331e26652da5952b8d4dee1d0c2cb216eb` |
| `cliente/Gesture.enu` | `8c6e3dc6c44d1d42135c3cd286b90406b861490fe868fd49f313fc10fecb9135` |
| `cliente/Granny.dll` | `a33bf57258ce71caf4d755364a7e44192a5a1433b98b6db4aaaf6542ba5f6c58` |
| `cliente/Gt_0000.enu` | `3d932fec53f6f0815344a61a2306fb9961d847f23e19b13292d5c18c3d976c50` |
| `cliente/Gt_1010.enu` | `5eb5ee615617061c10c73f5bd80aff295045d194ae7cabb944dbb2a566aac113` |
| `cliente/Gt_2000.enu` | `d4675d37a604d10d1c14819391fa12c288dfa7ce2245a56c8f564b6218dce70a` |
| `cliente/Gt_2310.enu` | `0ed5f886bf7298da6a96ceabc4dd8f507aa5bc4258714d9bbeb8857534fd323e` |
| `cliente/Gt_2400.enu` | `81eedcab77725a542ec81bc15589d2bc9084a4485eb5d4dd572cc009744beb8b` |
| `cliente/Gt_4000.enu` | `ef22e955f8c503241adfc78690abde626905d3155c4ca5a4bd83a3c908d622f5` |
| `cliente/Gt_5000.enu` | `0c4f5ed30d1f9c2c0962d5a2aecf25b4970e499636d88a299fafc1a1df557300` |
| `cliente/Gt_5400.enu` | `67910e859f374bf7a087c743412e5afceb1e4bad264b62323449174c861882dc` |
| `cliente/gump.def` | `2b2fcaf377614604337d5da3acfe511df435236559ace1e77c24c9c19b466775` |
| `cliente/Helpindx.dat` | `827e10160b88c5c087e66de3041d3322fc51fdbb6813ba5aaba443f6d85cd5d3` |
| `cliente/hues.mul` | `37e50418e65af6cf3ac30af70c32238578b321a11b6af90583fca600aeefa268` |
| `cliente/Igrping.dll` | `cdb77abb556f73cbb643abe99af4d898533f244e9bbe86a11934960e54f8a073` |
| `cliente/intloc00.enu` | `bd1037c479e49edcf856b577f252de8cf82d23bd8f6feb9764cede5c24b3a797` |
| `cliente/Intloc01.enu` | `40a15469e8f80a1849a213b31fc70f2e9339328c73e51dc2d4a1a1f9703151f9` |
| `cliente/INTLOC02.ENU` | `a83bbea1c88ba1009c38cfdff8f62c4ebd92a537247e0c6ef297f74ab5b5d06e` |
| `cliente/INTLOC06.ENU` | `7003a1bd2cf75b78c38d76210803fe0acd86f74b7294d1806f4f9b9c6bdbc596` |
| `cliente/INTLOC10.ENU` | `78b2d0861866013239e166679412d4ad674750e2fedb6405c8f8a641a565db5d` |
| `cliente/intloc11.enu` | `3a88378452ab1be9d7b65e5619c6c2615cdafd62a17bc7b05e4dbc822ce023c2` |
| `cliente/Intrface.def` | `60bc39836f4b68a375d01159f1d29aab0d960d46628ab8f63d74b9ede327948b` |
| `cliente/Intro.enu` | `24798fd2ecc50e18a8d6fd3234a6ec9973f4079fb151a3b1ba2bcfec54cf5c87` |
| `cliente/Keynames.txt` | `8cba8885990796ea6300b09394d5fc4b70ee3660dbafd692e84f396dfc271a07` |
| `cliente/Langcode.iff` | `cae80cbe4ad853af71c031e68e1e408cae59f7806dd07b9590560250457b36c0` |
| `cliente/light.mul` | `fa766be0fbd6626ac6b98e3cca025a907ecd89b060c8daac01f998cd2db14af8` |
| `cliente/lightidx.mul` | `3bedae724e5f7fb75e678a5445bacc38e4b1fed082e5d298cb34486bfcfcde75` |
| `cliente/Login.cfg` | `9114186953d48e5cba3cdba3caf17e8b46eced30520b8e9436069a1764990b51` |
| `cliente/Macros.txt` | `0e44c97e0bb97c64365c1ab8e1bc5af8d28e93ddfcd1a38b0eee03ff61f82544` |
| `cliente/MainMisc.uop` | `a68959f9cf84bf8a9bc400171fa3393eadb48b7f8e2e69cb56059757f1d4b185` |
| `cliente/map0LegacyMUL.uop` | `70536a33adeeb9746371c9492a42e39758b27b1f4d55210e491d05dbcfc82215` |
| `cliente/map0xLegacyMUL.uop` | `e1e5b11bbc17dc585d1f32592866e806f86718633ff484231d812d6ce1885ad6` |
| `cliente/map1LegacyMUL.uop` | `f8842608cdbb1b0b79daa9cf80fd0fd01010c4388165b633ec5dfdfd0a893753` |
| `cliente/map1xLegacyMUL.uop` | `42749f0b1dba0fcc99f676f130e877a202b6d2da054a1e9434cd67f8eafbae4a` |
| `cliente/map2LegacyMUL.uop` | `8581b08e41c426ad482f2183e778e5d62d0e3d7626034073ff07ccbd8c8d51d8` |
| `cliente/map2xLegacyMUL.uop` | `ef09c848a3662bf45af8401aea320085ff3f71f10a2763c77aa6f6dea29b0871` |
| `cliente/map3LegacyMUL.uop` | `b57463e03f66dc303d740ceced861512fda4f428d9607b215d54bbb9c38367c0` |
| `cliente/map4LegacyMUL.uop` | `5e34ec2655253781a634e62e6aa5fe09e3735357eef96d1ff9371389b051011f` |
| `cliente/map5LegacyMUL.uop` | `a36fa939a1f3472905aa2057d9f60896793c72805dadcb90136385bad3d86a4e` |
| `cliente/map5xLegacyMUL.uop` | `cb48c6e03ebe191a55d08e66e2ffc4e06cc8c3f9170b5fd9229fa0c58bba95b7` |
| `cliente/misc.txt` | `e4d2c6f271234de2c85c1f5c4066c1324b328cdec20f2692f844aac159a05149` |
| `cliente/mobtypes.txt` | `dafc9829a5933ee27f41ad8fc08e394603901b5f1bfd2eb0bcb769ff4f1ddf57` |
| `cliente/multi.idx` | `4e28b9631b5e3143b5a77d923f5896246cf114bdad2dd5952e7c22b9899180e0` |
| `cliente/multi.mul` | `2a26f4def2f030ec7f96057fc98a2a59fac1561848f59a3e45f477a5e1f8b7a0` |
| `cliente/MultiCollection.uop` | `905a81d578663fbbc061b2221bd5d150511ecce32469a4ccdeaa7e47f12fe8b1` |
| `cliente/Music.def` | `bfa505efd4e434104f2079356737ddf40b70c7b19a41aa67eeb89d600b88b921` |
| `cliente/Obscene.lst` | `597ef436ebfccdf3ff339ee7c56893662c7bdcaca08d5933e1c9e0631cce5225` |
| `cliente/options.enu` | `b5257684a513504b994305bf265129c47bafddc08fc8c0761da810bbffd0d861` |
| `cliente/OPTNUOTD.ENU` | `ce66ef0e0712263eea481792ea27de7e2cfd412e8016042e30dd95df584b53f4` |
| `cliente/Owo.exe` | `9d4af73194cadab9fe06a6367b624f4641aedabd1c420b08d1e5828405a5367d` |
| `cliente/palette.mul` | `7f9b3cfaf03c1ee37d4566f9a8ed5860a308ede22ab7444b876a736f67a1ed5d` |
| `cliente/Prof.txt` | `bec323eefa57bd47391a48bc57d5d5b451c7b269fa4dcbcf987ab51532432c81` |
| `cliente/Professn.enu` | `3da9be1912b7029b4ee4ad23af4addc5a717a8f1ee542c64aacf1b5d69bbb9bd` |
| `cliente/radarcol.mul` | `c2730eb59a241608849deb9204974a88b8ba27a935c3683b95c0e743ad2f7eba` |
| `cliente/roof.txt` | `622c19a7d76b1d573acc157ff097135c128a984967bffd5b9c4315abc987bd51` |
| `cliente/SKILL16.ENU` | `3ba94adace989f3e97f8e387f1fc4a2e4ee3a88eff5b37459cf239cc4a6daa69` |
| `cliente/SKILL30.ENU` | `326aac0752a118362b452a40829c2f5db057d640e055f9db48bbee785ae3685b` |
| `cliente/skillgrp.mul` | `d04243ac937c86ea85fc7b13b5edbbad2471c23fcdd4892c1515a5024c892912` |
| `cliente/Skills.idx` | `68df415c256c9bc518401184c880c3f0fb2a92a7ffe143f66e2d38c224d74c90` |
| `cliente/skills.mul` | `49ba0db15a4278ac26a93398ad851ba3e2a1fe133ada90fd4fc59536aa235be6` |
| `cliente/SKILNAME.ENU` | `ba6f552f4fc1cfbd12dccf410b61593552634bf560ad62042f8b2a18ba131fe7` |
| `cliente/Sound.def` | `ab80e0243dea9d28fa0cb780c538bc144c614ee275370bbaecff95d8b183461e` |
| `cliente/speech.mul` | `ba75c8c9296e4d6219f416b86e04af8df56d3f515904b6dec64681453a297db3` |
| `cliente/stadif0.mul` | `5ebe135be96f2b9ea9e56ad80ac405e6414e13a14c879e820d9231dc015a1496` |
| `cliente/stadif1.mul` | `25fba69d2f136932a197e6b6a902700b2d0fce1960750818070d96492f7783c9` |
| `cliente/stadif2.mul` | `c2eb6c27c34311d2d0f68cb4e2d34a5825baa8d3ef0b5a9fd3455c8cccca1bd5` |
| `cliente/stadifi0.mul` | `1bd60b5bb85027435c6b74ff7213e2e368bbe914dfc418f23529bbb556c1eee3` |
| `cliente/stadifi1.mul` | `cd93719f41db33c1c985ac62012bc001efa0287d1c0f8329434cd082ff635b1e` |
| `cliente/stadifi2.mul` | `ce272438c5ab36ad0e22c27373d206bdfaa5147c0d72ca7d269941878e2cb9e1` |
| `cliente/stadifl0.mul` | `dd892b6e46ceee94235bb4a847ddb3b5d78188772a621c3048e68be1e78988d8` |
| `cliente/stadifl1.mul` | `c464a2a346957829a6fa8a0f8a51f4b568d7781a78f91f9c261f2de2dd88bced` |
| `cliente/stadifl2.mul` | `8d291d6108ba80fd07e9c717d7c65cb9874bad04e7608a5a6b4db6cf6ae320a9` |
| `cliente/staidx0.mul` | `209319aeff26e01c7ea7ec86b8f01e3d598e4d82411431c43cb6e9b6ccc69de7` |
| `cliente/staidx0x.mul` | `f324b0862203e1099764c012dc4589649d3c7b12349bde4560ab089963a00438` |
| `cliente/staidx1.mul` | `d7ae4bfc790b7c14d4a7e30e9b97e4b6a22f2e027f79e00cc6af317a8b7d10d8` |
| `cliente/staidx1x.mul` | `36443b0fddfe002895a05b89c20961b6c96f78f03a6d6de892a1f9b52c15c0a4` |
| `cliente/staidx2.mul` | `7965f58fdbe393227f1adefd96f7c401bc0520e4fca8fabe98b12f02c2ccba76` |
| `cliente/staidx2x.mul` | `7965f58fdbe393227f1adefd96f7c401bc0520e4fca8fabe98b12f02c2ccba76` |
| `cliente/staidx3.mul` | `de067cf462c2aa831f72e332eb808c52e11c1faa68861ca5d540179b4c1683ad` |
| `cliente/staidx4.mul` | `1521f3e40fccd78c530a090136fa85fc2b436c9bb19a135fe7357c9f19b46282` |
| `cliente/staidx5.mul` | `d6735911b2a9e763dcd8d91ddb040d48fb4a2e6b7fdae12f4271011e58c56cbe` |
| `cliente/staidx5x.mul` | `d6735911b2a9e763dcd8d91ddb040d48fb4a2e6b7fdae12f4271011e58c56cbe` |
| `cliente/stairs.txt` | `7fdd445000433b3e33cbca370a9cb955174b0444aa54195a7a58f722e1aef2dd` |
| `cliente/statics0.mul` | `aac798ae8786d97eb893d5338e27113f3ace606221c4a7f80c24e57bd4a19976` |
| `cliente/statics0x.mul` | `a6ea999672c931fdc48b0fa506ad56f7d1a7eeeb96b6fb3a4cdfd0ea96065fe5` |
| `cliente/statics1.mul` | `2109d96b4d668a3df58564eb156e0020ddc0ba94f8aad2836c56d9511218e14b` |
| `cliente/statics1x.mul` | `954f691d884319723f9da9461119dbef629652b94e92c1e12c94145a0924ed90` |
| `cliente/statics2.mul` | `e9fbbe216ddc4eec9fad2f886f39654bec84806886cf3abcaeca45df300c4c73` |
| `cliente/statics2x.mul` | `e9fbbe216ddc4eec9fad2f886f39654bec84806886cf3abcaeca45df300c4c73` |
| `cliente/statics3.mul` | `c003ddff11a459c1c76c68615c350dd5c7a3e5a7f6112fb697de5e04d4239181` |
| `cliente/statics4.mul` | `e09b2d0c057910d3f4c7c86e0d0f1e0be16af4cd29c14b5d975bedefd67a15b7` |
| `cliente/statics5.mul` | `1aa4d692ffce66d628b39e5b30bfff51d112261f82057c794408337eb84baae9` |
| `cliente/statics5x.mul` | `1aa4d692ffce66d628b39e5b30bfff51d112261f82057c794408337eb84baae9` |
| `cliente/stitchin.def` | `dc1f4ff4f44e07de33952197b9c71f5cdbf7983408df8d75f86c10e89f8d8714` |
| `cliente/string_dictionary.uop` | `d09198f015a296dfaaf65061a61441e6bb6405058526beb8cd89468f2a9b9629` |
| `cliente/suppinfo.txt` | `d5c2e2fb46868c568312b9730d5c109bc1ca59ec039cae7c80d14eddbcaadbc8` |
| `cliente/teleprts.txt` | `3a2b84d14171042378d8196d5a795a78fcf21bef8f18d8ae688a4dc4e2752d8f` |
| `cliente/texidx.mul` | `491c96a4abc5554f467b1a71b652a8dba13600267e75c6988c8c419072b14458` |
| `cliente/TexTerr.def` | `6e5440326e5c813028b1c78e87631cc042ab0661ff180cbf89f565d314fd7825` |
| `cliente/Tile1024.txt` | `e11812f888d5cb65e8975df34d321efa3557b5fa7182a148660965efbc0af5d1` |
| `cliente/Tile256.txt` | `c21b438c36467d29ed28d2426d0e68f220406dfee10680eccfe45fb09d65409f` |
| `cliente/tileart.uop` | `17dc2b3cdb7d5a28037dcdfcc3f18c4392fb1a0b94ca63f888541bfe2ec00e1f` |
| `cliente/tiledata.mul` | `ddebc7f4433679be01090a6d325894dd5c586a7a629f49ac3d79857d6afd7aca` |
| `cliente/Tilehelp.enu` | `d4de5b6804bca37d49c23da66303669396f7431cab4961245f0339f946a027f0` |
| `cliente/Tooltips.enu` | `ea41e845a57cac83c85e619ba96206f8e31d4f1f867012d2c3c3c676b1de40a0` |
| `cliente/Transerv.exe` | `36cb9e331e09b8d63b246e49875347ed693c3d9ab81953bf28ec17d110fb90d0` |
| `cliente/UO-patch.cfg` | `936d7c98fad0ea290a74fb9dcdc11b506491af27d353ad21f358c539ed58f69d` |
| `cliente/UO.exe.manifest` | `51e1759297609aa396a83eb4ce1db8f662b754fdd9e0b32acaf02130d3863ffc` |
| `cliente/Uobscene.lst` | `82e067e387d8d265edb2fa41cf1a1c91d1ed120ca715bf6fe5200d56a4968ce9` |
| `cliente/Uomax.cfg` | `6199efff819de0d4c090c7b3fa8de06a3649ccad0bd93fe35283a96f7b182461` |
| `cliente/UOPatch.exe` | `8ec46f4be79d16a4688f4705ff948d7794f10f2d0d9558c1fea4631c5b256a63` |
| `cliente/Uoreg.cfg` | `cc6a35de0d79bdfaace36cc8b721c374c466af00cb52163fbe36a5a9cf5350f9` |
| `cliente/uotd.exe` | `25725f0140205ff1ce86818fff46cc287a10d6484a96b55ae0637ae047c56453` |
| `cliente/Uoupg.cfg` | `811e4009b5a2158cb94db126fb717a7894f6907d7c26a91a6dd55c2719009e39` |
| `cliente/vercfg.cfg` | `80f523d48b266af3ec423914fd41f543345fb0d4786eee59dc2bcfd56d08ca03` |
| `cliente/Version.dat` | `20833032bd75eeab4f3227d41e580f40113fe548da70f117edd9beae52e61f12` |
| `cliente/Version.txt` | `7745124819e6aa6c3ac9187de19cf859b5df50988af6c6dbe9a4f5a4a2ec3c40` |
| `cliente/walls.txt` | `697313fa7f7fd23bfe722fb66ab1c85588df4ccabaa956c1cbf0199a60060d2b` |
| `instalacao/GDF/UOClassicGDF.dll` | `918766ca41c4d7a39980afb3ae7c3360e3646ff0583f86283194b22fada8aaa6` |
| `instalacao/UO-patch.cfg` | `317cd313d3c78617c0a0f305757cbf452388b8cfa90ebdd2d0b1126f1780edd1` |
| `instalacao/Uo.cfg` | `dca109af7ad7f8afd15124a7659f858e21424803844d4fc0a7b5989082d3845a` |
| `instalacao/UO.exe` | `422c8fbbbe2105c4486bea88c9a6dea27a0e07d233ebd96f3f659143f3d83417` |

## Adendos

| Data | Tool | Nível | Motivo | Aprovação |
|---|---|---|---|---|
| 2026-10-28 | Nenhuma tool do REA nem do Ghidra: triagem passiva com PowerShell e Defender | N0/N1, já aprovados (status e níveis sem mudança) | O cliente completo foi baixado pelo patcher, rodado pelo responsável fora da sessão. Nova triagem e cópia do cliente (Adendo 1, abaixo) | Triagem pedida pelo responsável na sessão principal ("Sim, na sessão do protocolo"); cópia A + B aprovada pelo responsável nesta sessão |
| 2026-10-28 | Cópia de 3 arquivos de animação; leitores próprios em Node (só leitura) | N1, já aprovado (status e níveis sem mudança) | Reabertura da análise para fechar a §3.8 da especificação (Adendo 2, abaixo) | Decisão do responsável na sessão principal ("Reabrir, depois benchmark"), transmitida por ela a esta sessão |
| 2026-11-10 | Nenhuma tool do REA nem do Ghidra: leitura dos arquivos de `alvos/uo-classic/` em Node, só para medir o SHA-256 | N0/N1, já aprovados (status e níveis sem mudança) | Migração MEL-06a-m: seção 8 "Identidade dos arquivos", que o gate exige na admissão desde 2026-11-01 (Adendo 3, abaixo) | Aprovada pelo responsável na conversa ("Sim, fazer M-1"), só para este alvo |

### Adendo 1 — triagem passiva do cliente (2026-10-28)

Só leitura. Nada do cliente foi executado, nenhuma conexão foi aberta e o patcher não rodou.

**Inventário.** A pasta de origem tem 522 arquivos, 2.633 MB:

- 70 `.mul` (1.020 MB);
- 23 `.uop` (1.416 MB);
- 8 `.idx`;
- 93 `.mp3` (109 MB);
- 1 `.bik`;
- 10 `.exe`;
- 12 `.dll`;
- textos de dados em 8 idiomas;
- pastas `Data`, `GDF`, `logs`, `Music`, `notes` e `patcher`.

**Executáveis e DLLs (SHA-256):**

| Arquivo | Bytes | Versão / origem | Compilador e linkagem | Assinatura | SHA-256 |
|---|---|---|---|---|---|
| `client.exe` | 3616768 | Electronic Arts, Ultima Online 7.0.117.33 | PE32 x86, MSVC 2005 (linker 8.0), link em 2026-10-22 | não assinado | `6EEFCDC345FCFD54DA00D63045B5B753D51ECD8B90E30C414FCF14A6F5929B80` |
| `client_beta.exe` | 4492288 | Ultima Online 7.0.117.31 | PE32 x86, MSVC 2015+ (linker 14.0), link em 2026-10-20 | não assinado | `AE4EB4E186CFAE690234706FCAE08E36112C8B9E3D4189F0A299E66BBAE5C0BA` |
| `client_tc.exe` | 3325952 | Ultima Online 7.0.29.97 | PE32 x86, MSVC 2005, link em 2013-04-05 | não assinado | `6507E703B0AE65FA7BA174F53F86317AC3B736F0B12C1A8E86240B4CB03B5146` |
| `ClientPicker.exe` | 126976 | UO ClientPicker 1.0.0.1 | PE32, MSVC 6, 2008 | não assinado | `D55A83372238428F0A839279E5D332302FBF6F28F7857BBB15427874958905A5` |
| `UOPatch.exe` | 73728 | sem versão | PE32 de console, MSVC 2005, 2012 | não assinado | `8EC46F4BE79D16A4688F4705FF948D7794F10F2D0D9558C1FEA4631C5B256A63` |
| `Owo.exe` | 73728 | sem versão (Origin Worlds Online) | PE32, MSVC 5, 1999 | não assinado | `9D4AF73194CADAB9FE06A6367B624F4641AEDABD1C420B08D1E5828405A5367D` |
| `Transerv.exe` | 59904 | sem versão (servidor de tradução local) | PE32, MSVC 5, 1999 | não assinado | `36CB9E331E09B8D63B246E49875347ED693C3D9AB81953BF28EC17D110FB90D0` |
| `uotd.exe` | 24576 | uotd 1.0.0.1 (dica do dia) | PE32, MSVC 6, 2007 | não assinado | `25725F0140205FF1CE86818FFF46CC287A10D6484A96B55AE0637AE047C56453` |
| `UO.exe` / `UO.bin` | 583256 | Bioware Patch Client 1.0.6.5 (o mesmo do protocolo; `UO.bin` é a cópia que o patcher usa para se reiniciar) | PE32, MSVC 2005 | válida, Electronic Arts | `422C8FBBBE2105C4486BEA88C9A6DEA27A0E07D233EBD96F3F659143F3D83417` |
| `uninstUOClassic.exe` | 86294 | desinstalador NSIS (o mesmo do protocolo) | PE32 | não assinado | `43DD289F91A75D41013D8147B8D761E7C7B9A68B19162423DFEA86C51CDF843A` |
| `patchui.dll` / `patchui_win.dll` | 329304 | Mythic Patch Client UI 1.0.8.7 | PE32, MSVC 2005 | válida, Electronic Arts | `9310DEB92C0694729E2611BD2972ECE8CAD1FF381539F77FFF7C77BB96E6BAF4` |
| `Igrping.dll` | 20480 | sem versão | PE32, MSVC 6, 2001 | não assinado | `CDB77ABB556F73CBB643ABE99AF4D898533F244E9BBE86A11934960E54F8A073` |
| `Granny.dll` | 492032 | sem versão (RAD Granny, 2001) | PE32, MSVC 6 | não assinado | `A33BF57258CE71CAF4D755364A7E44192A5A1433B98B6DB4AAAF6542BA5F6C58` |
| `Binkw32.dll` | 291328 | RAD Bink and Smacker 1.0w | PE32, MSVC 6, 2000 | não assinado | `F2AD88706CF898FF489C5B3F19FAC5A4D51DD59110B8E919B518C1D0F9A9B73A` |
| `Patchw32.dll` | 202240 | Pocket Soft RTPatch 7.00 | PE32, 2002 | não assinado | `19486800845B74BE3487F1319D6F249CE85E8B47DF586DD8E9B9CBB46875AE93` |
| `dbghelp.dll` | 940032 | Microsoft Debugging Tools 6.3 (2004) | PE32 | não assinado | `412F6C0ED936316275E68E21DF7255E4E35FAD14E114E479E8C5C9D75ECAC88C` |
| `glew32.dll` | 424960 | GLEW 2.2.0 | PE32, MSVC 2019 | não assinado | `C087C55E2B1F12C1528ECDA97A55CC74ED0A8073BF1F35E52B4957138E8C5704` |
| `SDL2.dll` | 1364480 | SDL 2.30.11 | PE32, MSVC 2019 | não assinado | `B3516903E97055CAF9450A723833835D6D8DCB2024526F3FC0F3A0B216974A2C` |
| `SDL2_image.dll` | 229376 | SDL_image 2.8.8 | PE32, MSVC 2019 | não assinado | `6CF3EF42225F9CB039B68E463EE86AF6ACF2373A82CD5A7EF2CDEE308146BE76` |
| `SDL2_ttf.dll` | 1461760 | SDL_ttf 2.24.0 | PE32, MSVC 2019 | não assinado | `0B89721770517616E178907966C0135D9153918A9E5E2A8C52904CBF1E26DC12` |
| `GDF/UOClassicGDF.dll` | 221184 | Game Definition File (o mesmo do protocolo) | PE32 | não assinado | `918766CA41C4D7A39980AFB3AE7C3360E3646FF0583F86283194B22FADA8AAA6` |

**Engine e linguagem.** A engine é **nativa, não Unity**. Confirmado pelos arquivos:

- Nenhum PE tem cabeçalho CLR (.NET).
- Não há `UnityPlayer.dll`, `GameAssembly.dll`, `<Jogo>_Data/` nem strings de mono ou IL2CPP.
- Todos os PE têm cabeçalho Rich do MSVC, ou seja, foram compilados em C/C++ com Visual C++.

Detalhes por cliente:

- **`client.exe`:** importa `WSOCK32` (rede), `DDRAW`, `DSOUND`, `WINMM`, `binkw32` (vídeo), `igrping` e `dbghelp`, e cita `d3d9.dll` e `Direct3DCreate9`, o que indica Direct3D 9 carregado em tempo de execução. Também cita os formatos `.mul` e `.uop`.
- **`client_beta.exe`:** tem outra pilha de vídeo, SDL2 + OpenGL (`glew32`, `OPENGL32`). Isso indica um renderizador novo em teste.
- **`Granny.dll`:** nenhum dos clientes a importa estaticamente. O uso dela fica em aberto.

**Proteção.**

- **Packer:** nenhum.
  - O entry point fica em `.text`, os imports estão completos (por exemplo, 171 de `KERNEL32`) e a entropia de `.text` é normal (6,6).
  - As seções extras (`uva_data`, `LBMPEG_D`, `.debuu`) são pequenas. A `.data` do `client.exe` tem 300 KB em disco com entropia 7,1, consistente com tabelas embutidas, e o resto é memória não inicializada (cerca de 24 MB).
  - Fica como hipótese a conferir em N1, não como sinal de packer.
- **Anti-cheat e DRM:** nada encontrado. Não há strings nem módulos de EasyAntiCheat, BattlEye, nProtect/GameGuard, XIGNCODE, Themida, VMProtect ou UPX. `IsDebuggerPresent` aparece uma vez por binário, o padrão do runtime.
- **Assinatura:** só o patcher e o `patchui*.dll` são assinados pela EA. Os clientes e as DLLs de terceiros não têm assinatura.
- **Antivírus:** Microsoft Defender (`MpCmdRun -ScanType 3`) na pasta inteira, em 2026-10-28T12:24Z: nenhuma ameaça.
- **Classe:** continua C1. A origem é oficial (o patcher da EA baixou dos servidores da EA, segundo o log) e o scan veio limpo. A falta de assinatura nos clientes é uma nota, não um sinal forte.

**Dados pessoais e da conta.** Ficaram fora da cópia e de qualquer registro:

| Local | Conteúdo | Tratamento |
|---|---|---|
| `Uo.cfg` | [REDIGIDO: ID da conta], marcação de primeira execução e opções | fora da cópia. O cliente já foi aberto uma vez pelo responsável |
| `metrics.txt` | [REDIGIDO: perfil de hardware da máquina] | fora da cópia |
| `logs/patcher.102726.Log` | [REDIGIDO: caminhos locais e horários do patch] | fora da cópia. O log registra 1,78 GB de patch, de 2026-10-27, sem erro final |
| `notes/` | notas de versão da EA em 4 idiomas, com contatos públicos de suporte | fora da cópia (não servem à análise) |
| `GDF/` (`.lnk`, `.mcl`) | caminhos da máquina local | fora da cópia, como no protocolo |
| `Login.cfg` | servidores de login oficiais da EA (endereços públicos) | copiado: não é dado pessoal |

Não há pasta de personagens nem de macros do jogador. `Default.mac` e `Macros.txt` são os padrões de fábrica. Nenhum arquivo copiado contém o ID da conta, o usuário do Windows ou e-mail, conferido por busca na cópia.

**Cópia** para `alvos/uo-classic/cliente/`, aprovada pelo responsável (opção A + B): 147 arquivos, 631.935.447 bytes (602,6 MB), 0 divergências de hash. SHA-256 do conjunto (lista ordenada de `caminho:sha256`): `65D1BED3917BFE120F377D580FE6191BEFA41F74BE5E8532915A5ADEE0473F06`. A lista completa com hashes está em `saidas/uo-classic/triagem-cliente-sha256.tsv`, fora do git.

- **A (36,6 MB, 102 arquivos):**
  - os 10 `.exe` do cliente (não inclui `UO.exe`, que já está em `instalacao/`);
  - `Igrping.dll` e `Granny.dll`;
  - dados de regras: `tiledata`, `multi`, `MultiCollection`, `skills`, `skillgrp`, `hues`, `radarcol`, `animdata`, `animinfo`, `speech`, `light`, `texidx`, `palette`, `tileart.uop`, `string_dictionary.uop`, `MainMisc.uop` e `AnimationSequence.uop`;
  - os `.def`, `.txt` e `.cfg` de dados;
  - textos em inglês (`Cliloc.enu` e afins);
  - `Data/assetmap.xml`.
- **B (566 MB, 45 arquivos):** mundo (`map*LegacyMUL.uop`, `statics*`, `staidx*`, `stadif*`, `facet*`).
- **Fora:**
  - assets de arte, animação, som, gumps, fontes e texturas, além dos textos de outros idiomas: 195 arquivos, 1.890 MB. Só pelo `protocolo-assets`, se for pedido;
  - os itens pessoais acima, `Music/`, `patcher/` e o desinstalador: 180 arquivos, 140 MB.

**Consequência para o plano.** Os níveis continuam N0 e N1. A pilha da seção 3 vale para o cliente, mas o Ghidra deve importar a cópia de `alvos/uo-classic/cliente/`. O leitor dos formatos `.mul`/`.uop` continua dependendo de adendo (auditado, fixado e registrado no gate) antes de ser instalado.

### Adendo 2 — arquivos de animação e leitores próprios (2026-10-28)

Só leitura. Nada do cliente foi executado e não houve rede.

**Cópia** de `G:\Games\Electronic Arts\Ultima Online Classic` para `alvos/uo-classic/cliente/`, em 2026-10-28T14:24Z. O SHA-256 foi conferido na origem e no destino, e os quatro arquivos são iguais. O `AnimationSequence.uop` já estava na cópia A do Adendo 1; só foi conferido.

| Arquivo | Bytes | SHA-256 |
|---|---|---|
| `AnimationFrame6.uop` | 23596117 | `D6475B662BB1EC7B8334F51562207434486EF95C1791628FB2B69D1359132AC6` |
| `AnimationSequence.uop` | 119894 | `0651D15B248BB540D16514BF1F76C5FD3E4B1F84A487AE5B79A86182B09711B9` |
| `anim6.idx` | 949200 | `95D7F8A09AACE7F1DA7E489ED27058E9B988DE8AAD630351F266E24670F8374B` |
| `anim6.mul` | 48762346 | `918976721E944C73109CC50B6EE4E35ADCBC46428BBBE5EDD402A184C22CEC1D` |

Lista também em `saidas/uo-classic/copia-animacao-sha256.tsv`, fora do git. Os demais `AnimationFrame*.uop` e `anim*.mul` continuam fora. Nenhuma imagem é extraída ou convertida: a análise lê só cabeçalhos, tabelas e estatísticas, e assets seguem pelo `protocolo-assets`.

**Leitores próprios (registro tardio).** A pilha da seção 3 pede adendo para "um parser próprio a partir da documentação". Na análise de 2026-10-28 foram usados leitores próprios em Node, sem dependências, em `saidas/uo-classic/scripts/` (fora do git): só leitura de arquivos em `alvos/uo-classic/`, sem rede, sem escrita fora de `saidas/uo-classic/`. Este adendo registra o uso, que deveria ter sido registrado antes; o responsável pode pedir que os resultados sejam refeitos de outro modo.

### Adendo 3 — identidade dos arquivos, migração MEL-06a-m (2026-11-10)

Só leitura. Nada do alvo foi executado, nenhuma tool do REA ou do Ghidra foi chamada e não houve rede. Nenhum arquivo entrou em `alvos/uo-classic/` nem saiu de lá. `status` e `niveis_aprovados` não mudaram.

**Motivo.** Desde a MEL-06a (2026-11-01), o gate só admite um arquivo de `alvos/<slug>/` cujo SHA-256 esteja na seção 8. Este registro é anterior e não tinha a seção, então o alvo estava bloqueado na admissão.

**Fonte dos hashes.** A triagem, não o arquivo atual:

| Arquivos | Quantidade | Fonte |
|---|---|---|
| `instalacao/` | 4 | tabela "Arquivos" da seção 2, linhas copiadas |
| `cliente/`, cópia A + B | 147 | `saidas/uo-classic/triagem-cliente-sha256.tsv` (Adendo 1) |
| `cliente/`, animação | 3 | tabela do Adendo 2 |

**Conferência.**

- **Lista do Adendo 1.** Ela fica fora do git. Para prendê-la a este registro, o SHA-256 do conjunto foi recalculado a partir dela e é igual ao declarado no Adendo 1 (`65D1BED3…473F06`). A forma que reproduz o valor: uma linha `caminho:SHA-256` por arquivo, na ordem da lista, caminho com `\`, hash em maiúsculas, linhas unidas por LF sem quebra final, em UTF-8. A soma dos tamanhos também fecha: 631.935.447 bytes.
- **Fontes entre si.** As 10 linhas de executáveis e DLLs da tabela do Adendo 1 que estão na cópia batem com a lista. Os 4 hashes de `saidas/uo-classic/copia-animacao-sha256.tsv` batem com a tabela do Adendo 2.
- **Arquivos atuais.** Os 154 arquivos de `alvos/uo-classic/` (706.048.960 bytes, nenhum link) foram medidos de novo: 154 hashes e 154 tamanhos iguais aos da triagem. Não há arquivo sem hash de triagem nem hash de triagem sem arquivo.
- **Gate.** Com a seção 8, o `rea-gate.mjs` admite um arquivo de `instalacao/`, um de `cliente/` e o diretório `alvos/uo-classic/` inteiro, e continua recusando um caminho de fora do alvo.

**Observação.** O Adendo 1 fala em "os 10 `.exe` do cliente" na cópia A. A lista tem 8: os 10 da pasta de origem menos `UO.exe` e o desinstalador. O total de 147 arquivos e o hash do conjunto fecham, então a diferença é só de redação; o texto do Adendo 1 não foi alterado.
