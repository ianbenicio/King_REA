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

## Adendos

| Data | Tool | Nível | Motivo | Aprovação |
|---|---|---|---|---|
