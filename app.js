document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. VARIÁVEIS DE ESTADO ---
    let state = {
        step: 0,
        user: { nome: 'Anônimo', cpf: '' },
        location: null,
        files: [] 
    };

    let map = null, marker = null;
    const stepsIds = ['step-login', 'step-relato', 'step-anexos', 'step-revisao'];

    // --- 2. ELEMENTOS DO DOM ---
    const wizardBar = document.getElementById('wizard-progress');
    const mainForm = document.getElementById('main-form');
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    const btnSubmit = document.getElementById('btn-submit');
    const fixedBottom = document.querySelector('.fixed-bottom');
    const inputTexto = document.getElementById('texto');
    const selectTipo = document.getElementById('tipo');

    // --- 3. RECUPERAÇÃO DE RASCUNHO (OFFLINE RESILIENCE) ---
    // Atende ao requisito de usabilidade e robustez do Edital
    const rascunho = JSON.parse(localStorage.getItem('rascunho_manifestacao'));
    
    // Só recupera se os campos estiverem vazios (evita sobrescrever se recarregar rápido)
    if(rascunho && (!inputTexto.value && !selectTipo.value)) {
        if(rascunho.texto) inputTexto.value = rascunho.texto;
        if(rascunho.tipo) selectTipo.value = rascunho.tipo;
        
        // Feedback discreto
        if(rascunho.texto || rascunho.tipo) {
            const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
            Toast.fire({ icon: 'info', title: 'Rascunho recuperado' });
        }
    }

    // Salvar rascunho automaticamente a cada digitação
    [inputTexto, selectTipo].forEach(el => {
        el.addEventListener('input', () => {
            const dados = {
                texto: inputTexto.value,
                tipo: selectTipo.value
            };
            localStorage.setItem('rascunho_manifestacao', JSON.stringify(dados));
        });
    });

    // --- 4. INTELIGÊNCIA ARTIFICIAL "IZA" (SIMULAÇÃO) ---
    // Atende ao Item 8.2.1 e II do Edital
    inputTexto.addEventListener('blur', () => {
        const texto = inputTexto.value.toLowerCase();
        // Só sugere se tiver texto suficiente e nenhuma categoria selecionada
        if (texto.length > 10 && selectTipo.value === "") {
            simularAnaliseIZA(texto);
        }
    });

// ==========================================
    // LÓGICA DO CHATBOT IZA (NOVO)
    // ==========================================
    
    const chatWindow = document.getElementById('iza-chat-window');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatForm = document.getElementById('chat-form');
    let chatStep = 0; // Controla o passo da conversa

    // 1. Abrir/Fechar Chat
    document.getElementById('btn-open-chat').addEventListener('click', () => {
        chatWindow.classList.remove('d-none');
        // Pequeno delay para animação CSS funcionar
        setTimeout(() => chatWindow.classList.add('show'), 10);
        
        if (chatMessages.children.length === 0) {
            iniciarConversaChat();
        }
    });

    document.getElementById('btn-close-chat').addEventListener('click', () => {
        chatWindow.classList.remove('show');
        setTimeout(() => chatWindow.classList.add('d-none'), 300);
    });

    // 2. Fluxo da Conversa
    function botSay(html, delay = 600) {
        // Mostra "digitando..."
        document.querySelector('.status-typing').classList.remove('d-none');
        document.querySelector('.status-online').classList.add('d-none');

        setTimeout(() => {
            document.querySelector('.status-typing').classList.add('d-none');
            document.querySelector('.status-online').classList.remove('d-none');
            
            const bubble = document.createElement('div');
            bubble.className = 'chat-bubble bot shadow-sm';
            bubble.innerHTML = html;
            chatMessages.appendChild(bubble);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Toca som suave
            // if(navigator.vibrate) navigator.vibrate(20); 
        }, delay);
    }

    function userSay(text) {
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble user shadow-sm';
        bubble.innerText = text;
        chatMessages.appendChild(bubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function iniciarConversaChat() {
        chatStep = 0;
        botSay(`👋 Olá! Sou a <strong>IZA</strong>, a inteligência artificial da Ouvidoria.`);
        botSay(`Posso te ajudar a registrar sua manifestação por aqui mesmo, como numa conversa de WhatsApp.`);
        botSay(`Para começar: Você deseja se identificar?`, 1500);
        
        setTimeout(() => {
            const actions = document.createElement('div');
            actions.className = 'mt-2';
            actions.innerHTML = `
                <button class="btn btn-sm btn-outline-primary chat-option-btn" onclick="chatResponse('govbr')">🔐 Sim, usar Gov.br</button>
                <button class="btn btn-sm btn-outline-secondary chat-option-btn" onclick="chatResponse('anonimo')">🕵️ Não, prefiro Anônimo</button>
            `;
            chatMessages.appendChild(actions);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 2000);
    }

    // 3. Processar Respostas do Usuário
    window.chatResponse = function(action) {
        // Remove os botões anteriores para limpar o visual (opcional)
        const lastMsg = chatMessages.lastElementChild;
        if(lastMsg.querySelector('button')) lastMsg.remove();

        if (chatStep === 0) {
            if (action === 'govbr') {
                userSay('Quero entrar com Gov.br');
                botSay('Ok! Vou simular seu login rápido...');
                setTimeout(() => {
                    state.user = { nome: 'Maria Silva (Chat)', cpf: '000.***.***-00' };
                    botSay(`Pronto, <strong>${state.user.nome}</strong>!`);
                    avancarParaRelato();
                }, 1500);
            } else {
                userSay('Prefiro anônimo');
                state.user = { nome: 'Anônimo', cpf: '' };
                botSay('Sem problemas! Seus dados estão protegidos.');
                avancarParaRelato();
            }
        }
    };

    function avancarParaRelato() {
        chatStep = 1;
        botSay('Agora, me conte: <strong>O que aconteceu?</strong> Pode escrever, ou clicar no microfone 🎤 abaixo para mandar áudio.');
    }

    // 4. Envio de Texto pelo Chat
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        userSay(text);
        chatInput.value = '';

        if (chatStep === 1) {
            // Salva o texto no state global
            document.getElementById('texto').value = text;
            state.files = []; // Limpa anteriores

            // Tenta adivinhar a categoria (usando a mesma lógica da IZA que criamos antes)
            let sugestao = 'Solicitação'; // Default
            if (text.includes('buraco') || text.includes('luz')) sugestao = 'Solicitação';
            else if (text.includes('ruim') || text.includes('demora')) sugestao = 'Reclamação';
            else if (text.includes('roubo') || text.includes('ilegal')) sugestao = 'Denúncia';
            
            document.getElementById('tipo').value = sugestao;

            botSay(`Entendi. Parece ser uma <strong>${sugestao}</strong>. Já anotei aqui.`);
            botSay(`Você tem alguma foto, vídeo ou quer mandar a localização exata? Use os botões abaixo 👇. Se não tiver, digite "Não".`);
            chatStep = 2;
        } 
        else if (chatStep === 2) {
            if (text.toLowerCase().includes('não')) {
                finalizarPeloChat();
            } else {
                botSay('Certo. Se quiser adicionar algo mais, é só usar os botões. Quando terminar, digite "Finalizar".');
            }
            if (text.toLowerCase().includes('finalizar')) {
                finalizarPeloChat();
            }
        }
    });

    // 5. Triggers de Mídia do Chat (Botões do rodapé)
    window.chatTrigger = function(type) {
        if (type === 'mic') {
            // Simula clique no botão de gravar do formulário principal
            document.getElementById('audio-start-card').click();
            // Traz feedback pro chat
            userSay('🎤 [Gravando Áudio...]');
            // Observa quando a gravação acabar (simplificado)
            setTimeout(() => {
                if(state.files.some(f => f.type.includes('audio'))) {
                    botSay('Áudio recebido com sucesso! 🎧');
                }
            }, 5000); // Tempo estimado para o usuário gravar
        }
        else if (type === 'foto') {
            document.getElementById('camera').click();
            userSay('📸 [Abrindo Câmera...]');
            // Monitora input change
            document.getElementById('camera').onchange = () => {
                 botSay('Foto anexada! 🖼️');
            };
        }
        else if (type === 'geo') {
            document.getElementById('btn-geo').click();
            userSay('📍 [Enviando Localização...]');
            setTimeout(() => {
                if(state.location) botSay('Localização capturada! 🌎');
            }, 3000);
        }
    };

    function finalizarPeloChat() {
        chatStep = 3;
        botSay('Perfeito! Já reuni todas as informações.');
        botSay('Estou gerando seu protocolo oficial...');
        
        setTimeout(() => {
            // Simula o Submit do Form Principal
            const eventoSubmit = new Event('submit');
            mainForm.dispatchEvent(eventoSubmit);
            
            // Fecha o chat e mostra a tela de sucesso
            chatWindow.classList.remove('show');
            setTimeout(() => chatWindow.classList.add('d-none'), 300);
        }, 2000);
    }

    function simularAnaliseIZA(texto) {
        let sugestao = "";
        
        // Lógica de palavras-chave para simular a IA
        if (texto.includes('buraco') || texto.includes('lixo') || texto.includes('luz') || texto.includes('asfalto')) sugestao = 'Solicitação';
        else if (texto.includes('ruim') || texto.includes('demora') || texto.includes('atendimento') || texto.includes('fila')) sugestao = 'Reclamação';
        else if (texto.includes('ótimo') || texto.includes('parabéns') || texto.includes('excelente') || texto.includes('obrigado')) sugestao = 'Elogio';
        else if (texto.includes('desvio') || texto.includes('roubo') || texto.includes('ilegal') || texto.includes('corrupção')) sugestao = 'Denúncia';
        else if (texto.includes('ideia') || texto.includes('poderia') || texto.includes('melhoria')) sugestao = 'Sugestão';

        if (sugestao) {
            // Efeito sonoro sutil (opcional)
            if(navigator.vibrate) navigator.vibrate(50);

            Swal.fire({
                title: 'Olá, aqui é a IZA! 🤖',
                html: `Analisei seu relato e parece ser uma <strong>${sugestao}</strong>.<br>Posso marcar essa categoria para você?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#003399',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sim, obrigado!',
                cancelButtonText: 'Não, eu escolho'
            }).then((result) => {
                if (result.isConfirmed) {
                    selectTipo.value = sugestao;
                    // Salva a alteração da IA no rascunho também
                    localStorage.setItem('rascunho_manifestacao', JSON.stringify({ texto: inputTexto.value, tipo: sugestao }));
                    
                    // Feedback visual
                    selectTipo.classList.add('is-valid'); 
                    setTimeout(() => selectTipo.classList.remove('is-valid'), 2000);
                }
            });
        }
    }

    // --- 5. LOGIN (SIMULAÇÃO) ---
    document.getElementById('btn-govbr').addEventListener('click', () => mockLogin('govbr'));
    document.getElementById('btn-anonimo').addEventListener('click', () => mockLogin('anonimo'));

    function mockLogin(type) {
        if(type === 'govbr') {
            Swal.fire({
                title: 'Acessando gov.br',
                html: 'Autenticando credenciais...',
                timer: 1500,
                timerProgressBar: true,
                didOpen: () => Swal.showLoading()
            }).then(() => {
                state.user = { nome: 'Maria Silva', cpf: '000.***.***-00' };
                iniciarWizard();
                const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
                Toast.fire({ icon: 'success', title: `Bem-vinda, ${state.user.nome}` });
            });
        } else {
            iniciarWizard();
        }
    }

    function iniciarWizard() {
        document.getElementById('step-login').classList.add('d-none');
        mainForm.classList.remove('d-none');
        wizardBar.classList.remove('d-none');
        goToStep(1);
    }

    // --- 6. NAVEGAÇÃO DO WIZARD ---
    btnNext.addEventListener('click', () => {
        if (validateStep(state.step)) goToStep(state.step + 1);
    });

    btnPrev.addEventListener('click', () => goToStep(state.step - 1));

    function goToStep(stepIndex) {
        const currentId = stepsIds[state.step];
        const nextId = stepsIds[stepIndex];

        const currentSection = document.getElementById(currentId);
        const nextSection = document.getElementById(nextId);

        if (!nextSection) return;

        if (currentSection) currentSection.classList.add('d-none');
        else document.querySelectorAll('.step-section').forEach(el => el.classList.add('d-none'));
        
        state.step = stepIndex;
        nextSection.classList.remove('d-none');
        
        nextSection.focus(); 
        window.scrollTo(0, 0);

        updateProgressBar();
        updateButtons();
    }

    function validateStep(step) {
        if (step === 1) { 
            const tipo = document.getElementById('tipo').value;
            const texto = document.getElementById('texto').value;
            if (!tipo || !texto) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Campos Obrigatórios',
                    text: 'Selecione o tipo de manifestação e preencha a descrição.',
                    confirmButtonColor: '#003399'
                });
                return false;
            }
        }
        return true;
    }

    function updateProgressBar() {
        const percent = (state.step / 3) * 100;
        document.querySelector('.progress-bar').style.width = `${percent}%`;
    }

    function updateButtons() {
        if (state.step === 1) {
            btnPrev.classList.add('d-none');
            btnNext.classList.remove('d-none');
            btnSubmit.classList.add('d-none');
            btnNext.innerHTML = 'Continuar <i class="bi bi-arrow-right ms-2"></i>';
        } 
        else if (state.step === 2) {
            btnPrev.classList.remove('d-none');
            btnNext.classList.remove('d-none');
            btnSubmit.classList.add('d-none');
            btnNext.innerHTML = 'Revisar <i class="bi bi-check-circle ms-2"></i>';
        }
        else if (state.step === 3) {
            btnPrev.classList.remove('d-none');
            btnNext.classList.add('d-none'); 
            btnSubmit.classList.remove('d-none'); 
            preencherRevisao(); 
        }
    }

    // --- LÓGICA DE ORIENTAÇÕES (PÁGINA DEDICADA) ---
    document.querySelectorAll('.btn-open-orientacoes').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.step-section').forEach(el => el.classList.add('d-none'));
            document.getElementById('main-form').classList.add('d-none');
            wizardBar.classList.add('d-none');
            fixedBottom.classList.add('d-none');

            const orientacoesPage = document.getElementById('step-orientacoes');
            orientacoesPage.classList.remove('d-none');
            window.scrollTo(0,0);
        });
    });

    document.querySelectorAll('.btn-close-orientacoes').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('step-orientacoes').classList.add('d-none');
            
            if(state.step === 0) {
                document.getElementById('step-login').classList.remove('d-none');
            } else {
                document.getElementById('main-form').classList.remove('d-none');
                wizardBar.classList.remove('d-none');
                fixedBottom.classList.remove('d-none');
                const currentId = stepsIds[state.step];
                document.getElementById(currentId).classList.remove('d-none');
            }
        });
    });

    function preencherRevisao() {
        const checkEl = (id) => document.getElementById(id) || { innerText: '' };

        checkEl('review-nome').innerText = state.user.nome;
        checkEl('review-tipo').innerText = document.getElementById('tipo').value;
        checkEl('review-texto').innerText = document.getElementById('texto').value;
        
        const geoText = state.location 
            ? `${state.location.lat.toFixed(5)}, ${state.location.lng.toFixed(5)}` 
            : 'Não informada (Opcional)';
        checkEl('review-geo').innerText = geoText;

        const qtd = state.files.length;
        checkEl('review-anexos').innerText = qtd > 0 
            ? `${qtd} arquivo(s) anexado(s).` 
            : 'Nenhum arquivo.';
    }

    // --- GEOLOCALIZAÇÃO ---
    document.getElementById('btn-geo').addEventListener('click', () => {
        const btn = document.getElementById('btn-geo');
        
        if (!navigator.geolocation) {
            Swal.fire('Erro', 'Seu navegador não suporta geolocalização.', 'error');
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Obtendo...';

        navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            state.location = { lat: latitude, lng: longitude };
            
            document.getElementById('mapa-preview').classList.remove('d-none');
            document.getElementById('geo-text').innerHTML = `Latitude: ${latitude.toFixed(5)}<br>Longitude: ${longitude.toFixed(5)}`;
            btn.innerHTML = '<i class="bi bi-check-lg"></i> Localização Definida';
            btn.className = 'btn btn-success btn-sm rounded-pill mb-2';

            if (!map) {
                map = L.map('mapa-preview').setView([latitude, longitude], 15);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
            } else {
                map.setView([latitude, longitude], 15);
                setTimeout(() => map.invalidateSize(), 200);
            }
            if (marker) map.removeLayer(marker);
            marker = L.marker([latitude, longitude]).addTo(map);

        }, () => {
            btn.disabled = false;
            btn.innerHTML = 'Tentar novamente';
            Swal.fire('Erro', 'Permissão de localização negada.', 'error');
        });
    });

    // --- AUDIO ---
    let mediaRecorder;
    let audioChunks = [];
    let recordInterval; 

    const audioStartBtn = document.getElementById('audio-start-card');
    const audioUI = document.getElementById('audio-recording-ui');
    const audioSuccess = document.getElementById('audio-success-ui');
    const btnStop = document.getElementById('btn-stop-record');
    const btnDeleteAudio = document.getElementById('btn-delete-audio');
    const timerDisplay = document.getElementById('recording-timer');

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }

    audioStartBtn.addEventListener('click', async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            Swal.fire('Erro', 'Navegador sem suporte a microfone.', 'error');
            return;
        }

        try {
            if(navigator.vibrate) navigator.vibrate(50);

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

            mediaRecorder.onstop = () => {
                clearInterval(recordInterval); 
                
                const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
                const audioFile = new File([audioBlob], `relato_voz_${Date.now()}.mp3`, { type: 'audio/mp3' });
                
                state.files.push(audioFile);
                
                audioUI.classList.add('d-none');
                audioSuccess.classList.remove('d-none');
                
                if(navigator.vibrate) navigator.vibrate([50, 50, 50]);
                
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            audioStartBtn.classList.add('d-none');
            audioUI.classList.remove('d-none');

            let seconds = 0;
            timerDisplay.innerText = "00:00";
            recordInterval = setInterval(() => {
                seconds++;
                timerDisplay.innerText = formatTime(seconds);
            }, 1000);

        } catch (err) {
            console.error(err);
            Swal.fire('Permissão Negada', 'Ative o microfone para gravar.', 'warning');
        }
    });

    btnStop.addEventListener('click', () => {
        if(mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            if(navigator.vibrate) navigator.vibrate(50);
        }
    });

    btnDeleteAudio.addEventListener('click', () => {
        state.files = state.files.filter(f => !f.name.startsWith("relato_voz"));
        audioSuccess.classList.add('d-none');
        audioStartBtn.classList.remove('d-none');
        if(navigator.vibrate) navigator.vibrate(50);
    });

    // --- UPLOAD ---
    document.querySelectorAll('.media-input').forEach(input => {
        input.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                if(file.size > 5 * 1024 * 1024) {
                    Swal.fire('Erro', 'Arquivo muito grande (Máx 5MB)', 'error');
                    return;
                }
                state.files.push(file);
                addFilePreview(file, input.id);
                input.value = ''; 
            }
        });
    });

    function addFilePreview(file, type) {
        const list = document.getElementById('file-preview-list');
        
        let icon = 'file-earmark';
        let color = 'bg-light text-secondary';
        
        if(type === 'camera' || file.type.startsWith('image')) { icon = 'image'; color = 'bg-primary-subtle text-primary'; }
        if(type === 'video' || file.type.startsWith('video')) { icon = 'camera-video'; color = 'bg-danger-subtle text-danger'; }

        const div = document.createElement('div');
        div.className = 'alert alert-light border shadow-sm d-flex align-items-center justify-content-between py-2 mb-2 fade show';
        
        // Adicionado alt text simulado para acessibilidade
        div.innerHTML = `
            <div class="d-flex align-items-center gap-3 overflow-hidden" role="img" aria-label="Arquivo anexado: ${file.name}">
                <div class="${color} rounded d-flex align-items-center justify-content-center" style="width:40px; height:40px">
                    <i class="bi bi-${icon} fs-5" aria-hidden="true"></i>
                </div>
                <div class="lh-1 overflow-hidden">
                    <small class="fw-bold d-block text-truncate">${file.name}</small>
                    <small class="text-muted" style="font-size: 0.7rem;">${(file.size/1024).toFixed(1)} KB</small>
                </div>
            </div>
            <button type="button" class="btn btn-sm text-danger remove-btn" aria-label="Remover anexo"><i class="bi bi-trash"></i></button>
        `;

        div.querySelector('.remove-btn').addEventListener('click', () => {
            state.files = state.files.filter(f => f !== file);
            div.remove();
        });
        list.appendChild(div);
    }

    // --- ENVIO ---
    mainForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        Swal.fire({
            title: 'Enviando ao GDF',
            html: 'Gerando protocolo criptografado...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        setTimeout(() => {
            Swal.close();
            const protocolo = `OUV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
            
            document.getElementById('protocolo-final').innerText = protocolo;
            document.getElementById('data-final').innerText = new Date().toLocaleDateString('pt-BR');

            // Limpa o rascunho após envio com sucesso!
            localStorage.removeItem('rascunho_manifestacao');

            mainForm.classList.add('d-none');
            wizardBar.classList.add('d-none');
            fixedBottom.classList.add('d-none'); 
            document.getElementById('step-sucesso').classList.remove('d-none');
        }, 2000);
    });
    
    // --- PWA ---
    let deferredPrompt;
    const installToast = document.getElementById('install-toast');
    const installBtn = document.getElementById('btn-install-app');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if(installToast) {
            installToast.style.display = 'block';
            installToast.classList.add('show');
        }
    });

    if(installBtn) {
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted' && installToast) {
                    installToast.style.display = 'none';
                }
                deferredPrompt = null;
            }
        });
    }

    // --- ONBOARDING ---
    const driverObj = window.driver.js.driver({
        showProgress: true,
        animate: true,
        allowClose: true,
        doneBtnText: 'Entendi, vamos lá!',
        nextBtnText: 'Próximo',
        prevBtnText: 'Anterior',
        steps: [
            { 
                element: '.app-header', 
                popover: { 
                    title: 'Bem-vindo ao Participa DF!', 
                    description: 'Esta é a nova Ouvidoria Digital. Simples, rápida e acessível.' 
                } 
            },
            { 
                element: '.accessibility-fab', 
                popover: { 
                    title: 'Acessibilidade Total', 
                    description: 'Toque aqui para ajustar o contraste, aumentar a fonte ou ativar a fonte para disléxicos.',
                    side: 'left' 
                } 
            },
            { 
                element: '#btn-govbr', 
                popover: { 
                    title: 'Login Seguro', 
                    description: 'Acesse com sua conta Gov.br para acompanhar suas manifestações.' 
                } 
            },
            { 
                element: '#btn-anonimo', 
                popover: { 
                    title: 'Denúncia Anônima', 
                    description: 'Prefere não se identificar? Use esta opção. Garantimos sigilo absoluto.' 
                } 
            },
            { 
                element: '#offline-indicator', 
                popover: { 
                    title: 'Funciona Offline', 
                    description: 'Sem internet? Não tem problema. Grave sua manifestação e enviamos quando conectar.',
                    side: 'bottom'
                } 
            }
        ],
        onDestroyStarted: () => {
            if(!driverObj.hasNextStep() || confirm("Pular a apresentação?")) {
                localStorage.setItem('tutorial_visto', 'true');
                driverObj.destroy();
            }
        },
    });

    const tutorialVisto = localStorage.getItem('tutorial_visto');
    if (!tutorialVisto) {
        setTimeout(() => { driverObj.drive(); }, 1500);
    }
});

// --- GLOBAIS ---
window.toggleContrast = function() {
    document.body.classList.toggle('high-contrast');
    const isContrast = document.body.classList.contains('high-contrast');
    document.body.setAttribute('data-theme', isContrast ? 'dark' : 'light');
}

window.toggleDyslexia = function() {
    document.body.classList.toggle('dyslexia-font');
}

let currentFontSize = 100;
window.changeFontSize = function(dir) {
    currentFontSize += (dir * 10);
    if(currentFontSize < 80) currentFontSize = 80;
    if(currentFontSize > 150) currentFontSize = 150;
    document.body.style.fontSize = `${currentFontSize}%`;
}

window.compartilharProtocolo = function() {
    if (navigator.share) {
        navigator.share({
            title: 'Participa DF',
            text: `Meu protocolo Ouvidoria: ${document.getElementById('protocolo-final').innerText}`,
            url: window.location.href
        });
    } else {
        Swal.fire('Info', 'Tire um print para salvar.', 'info');
    }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

function updateOnlineStatus() {
    const indicator = document.getElementById('offline-indicator');
    if(indicator) {
        if (!navigator.onLine) {
            indicator.classList.remove('d-none');
        } else {
            indicator.classList.add('d-none');
        }
    }
}
updateOnlineStatus();

window.startTour = function() {
    localStorage.removeItem('tutorial_visto');
    location.reload();
}

// --- DARK MODE LOGIC ---
function toggleDarkMode() {
    const body = document.body;
    const icon = document.getElementById('theme-icon');
    
    // Toggle class/attribute
    const isDark = body.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    
    // Update Icon
    if (newTheme === 'dark') {
        icon.classList.remove('bi-moon-stars-fill');
        icon.classList.add('bi-sun-fill');
    } else {
        icon.classList.remove('bi-sun-fill');
        icon.classList.add('bi-moon-stars-fill');
    }

    // Save preference
    localStorage.setItem('theme', newTheme);
}

// Check preference on load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.setAttribute('data-theme', 'dark');
        const icon = document.getElementById('theme-icon');
        if(icon) {
            icon.classList.remove('bi-moon-stars-fill');
            icon.classList.add('bi-sun-fill');
        }
    }
});

// --- FUNÇÃO PARA ATIVAR/DESATIVAR VLIBRAS ---
window.toggleVLibras = function() {
    const body = document.body;
    const iconCheck = document.getElementById('icon-vlibras-check');
    
    // Alterna a classe que mostra/esconde o widget
    body.classList.toggle('vlibras-active');
    
    // Feedback visual no menu (mostra/esconde o check verde)
    if (body.classList.contains('vlibras-active')) {
        iconCheck.classList.remove('d-none');
        // Inicializa o widget se ele ainda não foi carregado corretamente
        if(window.VLibras && window.VLibras.Widget) {
             // Força um redraw caso necessário
             window.dispatchEvent(new Event('resize'));
        }
    } else {
        iconCheck.classList.add('d-none');
    }
}

// --- LÓGICA PARA ARRASTAR O BOTÃO (DRAGGABLE FAB) ---
document.addEventListener('DOMContentLoaded', () => {
    const fab = document.getElementById('fab-drag');
    const fabBtn = document.getElementById('btn-access-toggle');
    
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;
    let hasMoved = false;

    // Função para iniciar o arrasto
    function dragStart(e) {
        // Se for toque, pega o primeiro dedo, senão pega o mouse
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        initialLeft = fab.offsetLeft;
        initialTop = fab.offsetTop;
        startX = clientX;
        startY = clientY;
        isDragging = true;
        hasMoved = false;

        // Remove a transição suave durante o arrasto para não ficar lento
        fab.style.transition = 'none';
        fab.style.bottom = 'auto'; // Remove o posicionamento fixo bottom
        fab.style.right = 'auto';  // Remove o posicionamento fixo right
        
        // Define a posição inicial absoluta
        fab.style.left = initialLeft + "px";
        fab.style.top = initialTop + "px";
    }

    // Função durante o arrasto
    function dragMove(e) {
        if (!isDragging) return;
        
        e.preventDefault(); // Evita scroll da tela enquanto arrasta o botão

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const dx = clientX - startX;
        const dy = clientY - startY;

        // Se moveu mais que 5 pixels, consideramos que é um arrasto e não um clique
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            hasMoved = true;
        }

        fab.style.left = (initialLeft + dx) + "px";
        fab.style.top = (initialTop + dy) + "px";
    }

    // Função ao soltar
    function dragEnd(e) {
        if (!isDragging) return;
        isDragging = false;
        
        // Restaura transição suave se quiser animação futura
        fab.style.transition = 'transform 0.2s';
        
        // Se o usuário arrastou, precisamos impedir que o menu abra
        if (hasMoved) {
            // Pequeno hack: Clona e substitui o botão para matar os ouvintes de clique do Bootstrap temporariamente
            // ou usamos stopPropagation no evento de click.
            // A solução mais simples para Bootstrap dropdowns:
            setTimeout(() => { hasMoved = false; }, 100); 
        }
    }

    // Eventos de Mouse (Desktop)
    fab.addEventListener('mousedown', dragStart);
    window.addEventListener('mousemove', dragMove);
    window.addEventListener('mouseup', dragEnd);

    // Eventos de Touch (Mobile)
    fab.addEventListener('touchstart', dragStart, { passive: false });
    window.addEventListener('touchmove', dragMove, { passive: false });
    window.addEventListener('touchend', dragEnd);

    // Impede que o menu abra se foi um arrasto
    fabBtn.addEventListener('click', (e) => {
        if (hasMoved) {
            e.preventDefault();
            e.stopPropagation();
            // Fecha o dropdown se ele tentar abrir
            const dropdown = bootstrap.Dropdown.getInstance(fabBtn);
            if(dropdown) dropdown.hide();
        }
    });
});