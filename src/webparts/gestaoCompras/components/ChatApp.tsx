import * as React from 'react';
import { useState, useEffect } from 'react';
import { Stack, Text, Separator, TextField, PrimaryButton, IStackTokens } from '@fluentui/react';
import { getSP } from '../../../pnpjsconfig';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPFI } from '@pnp/sp';

interface IChatAppProps {
    userDisplayName: string;
    context: WebPartContext;
}

interface ISharePointItem {
    Id: number;
    Title: string;
    MensagemdoChat: string;
    IDdoPedido: number;
    Author: { Title: string };
    Created: string;
}

export interface IChatMessage {
    Id: number;
    Title: string;
    PedidoId: number;
    AuthorTitle: string;
    MessageBody: string;
    Created: Date;
}

const SEND_BUTTON_COLOR = '#FFD75E';
const LIST_NAME = "Mensagens de Compra"; // Nome da lista no SharePoint

const ChatApp: React.FC<IChatAppProps> = ({ userDisplayName = "Usuário Desconhecido", context }): JSX.Element => {

    const [sp, setSp] = useState<SPFI | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState<IChatMessage[]>([]);

    const [isPnPReady, setIsPnPReady] = useState<boolean>(false);
    const [hasInitializedPnP, setHasInitializedPnP] = useState<boolean>(false);

    // --- Lógica de Carregamento (USANDO OS NOMES INTERNOS FINAIS) ---
    const loadData = async (spInstance: SPFI): Promise<void> => {
        try {
            const spAny: any = spInstance;

            // 1. Carregar mensagens existentes
            const rawMessages: ISharePointItem[] = await spAny.web.lists.getByTitle(LIST_NAME)
                // USANDO NOMES INTERNOS FINAIS NO SELECT
                .items.select("Id", "Title", "MensagemdoChat", "IDdoPedido", "Author/Title", "Created")
                .expand("Author")
                .orderBy("Created", false)
                ();

            const formattedMessages: IChatMessage[] = rawMessages.map((item: ISharePointItem) => ({
                Id: item.Id,
                Title: item.Title,
                PedidoId: item.IDdoPedido, // Mapeado
                AuthorTitle: item.Author ? item.Author.Title : "Desconhecido",
                MessageBody: item.MensagemdoChat, // Mapeado
                Created: new Date(item.Created),
            }));

            setMessages(formattedMessages);
            console.log("Dados carregados com sucesso. Chat pronto.");

        } catch (e) {
            console.error("Erro ao carregar dados do SharePoint (Verifique se a lista e as colunas existem!):", e);
        } finally {
            setLoading(false);
        }
    };

    // --- Lógica de Envio (USANDO OS NOMES INTERNOS FINAIS) ---
    const sendNewMessage = async (): Promise<void> => {
        console.log("CLIQUE NO BOTÃO DETECTADO!");

        const spAny: any = sp;

        if (!newMessage.trim() || !spAny || !isPnPReady) {
            console.error("Instância PnPjs não está pronta no momento do clique. Tentativa bloqueada.");
            return;
        }

        const fakePedidoId = 1;

        try {
            setLoading(true);

            // Garante que o usuário atual está pronto
            const currentUser = await spAny.web.currentUser.select("Id")();


            await spAny.web.lists.getByTitle(LIST_NAME).items.add({
                Title: `Msg Pedido ${fakePedidoId} - ${new Date().toLocaleString()}`,
                IDdoPedido: fakePedidoId,
                MensagemdoChat: newMessage,
                AuthorId: currentUser.Id,
            });

            console.log('Mensagem enviada com sucesso!');
            setNewMessage('');
            if (sp) {
                void loadData(sp);
            }
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            alert('Falha ao enviar mensagem. Verifique o console.');
        } finally {
            setLoading(false);
        }
    };

    // --- Efeito de Inicialização (Autenticação) ---
    useEffect(() => {
        if (hasInitializedPnP) { return; }
        setHasInitializedPnP(true);

        const initializedSp = getSP(context);
        setSp(initializedSp);

        // Tenta buscar o objeto web para confirmar autenticação
        initializedSp.web().then(() => {
            setIsPnPReady(true);
            console.log("PnPjs autenticado com sucesso e pronto para uso.");

            setLoading(true);
            void loadData(initializedSp);
        }).catch((e) => {
            console.error("PnPjs Falhou ao inicializar a autenticação (web call failed).", e);
            setLoading(false);
        });

    }, [context]);


    // --- JSX (Layout) ---
    const stackTokens: IStackTokens = { childrenGap: 15 };

    return (
        <Stack tokens={stackTokens} styles={{ root: { border: '1px solid #ccc', padding: 15, borderRadius: 3, minHeight: '500px' } }}>
            <Text variant="large" styles={{ root: { fontWeight: 'bold' } }}>
                💬Mensagem (Chat)
            </Text>
            <Separator />

            {/* Mensagens (Display) */}
            <div style={{ flexGrow: 1, overflowY: 'auto', border: '1px solid #eee', padding: 10, minHeight: '300px', display: 'flex', flexDirection: 'column-reverse' }}>
                {loading && <Text>Carregando dados...</Text>}
                {!isPnPReady && !loading && <Text variant="small" styles={{ root: { color: 'red' } }}>Aguardando autenticação PnPjs.</Text>}

                {messages.length === 0 && isPnPReady && !loading && (
                    <Text variant="small" styles={{ root: { color: 'gray' } }}>Nenhuma mensagem encontrada. Envie a primeira!</Text>
                )}

                {messages.map((msg) => (
                    <Stack key={msg.Id} styles={{ root: { padding: 5, borderBottom: '1px dotted #ccc', marginBottom: 5 } }}>
                        <Text variant="small" styles={{ root: { fontWeight: 'bold' } }}>
                            {msg.AuthorTitle} ({String(msg.Created.toLocaleTimeString())}):
                        </Text>
                        <Text variant="medium">{msg.MessageBody}</Text>
                    </Stack>
                ))}
            </div>

            {/* Input e Botão */}
            <Stack horizontal tokens={{ childrenGap: 10 }}>
                <TextField
                    multiline
                    rows={3}
                    value={newMessage}
                    onChange={(_, newValue) => setNewMessage(newValue || '')}
                    placeholder="Digite sua mensagem aqui..."
                    styles={{
                        root: { flexGrow: 1 },
                        fieldGroup: { borderColor: '#999' }
                    }}
                    disabled={!isPnPReady || loading}
                />
                <PrimaryButton
                    text="Enviar Mensagem"
                    onClick={sendNewMessage}
                    disabled={!isPnPReady || !newMessage.trim() || loading} 
                    styles={{
                        root: {
                            color: 'black',
                            height: 40,
                            alignSelf: 'flex-start',
                            backgroundColor: SEND_BUTTON_COLOR,
                            borderColor: SEND_BUTTON_COLOR,
                            borderRadius: 10
                        },
                        rootHovered: {
                            backgroundColor: '#FFAA00',
                            borderColor: '#FFAA00',
                        }
                    }}
                />
            </Stack>
        </Stack>
    );
};

export default ChatApp;