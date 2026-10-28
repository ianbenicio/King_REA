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
| 2026-10-28 | Nenhuma tool do REA nem do Ghidra: triagem passiva com PowerShell e Defender | N0/N1, já aprovados (status e níveis sem mudança) | O cliente completo foi baixado pelo patcher, rodado pelo responsável fora da sessão. Nova triagem e cópia do cliente (Adendo 1, abaixo) | Triagem pedida pelo responsável na sessão principal ("Sim, na sessão do protocolo"); cópia A + B aprovada pelo responsável nesta sessão |

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
