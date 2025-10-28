import * as React from 'react';
import { Stack, Text, Separator, PrimaryButton } from '@fluentui/react';
import { getSP } from '../../../pnpjsconfig'; 
import "@pnp/sp/webs"; 
import "@pnp/sp/site-users"; // Importa o módulo site-users para habilitar o método siteUsers
import { ISiteUser } from "@pnp/sp/site-users/types"; // Correção na importação do tipo


interface IChatAppProps {}

// Altere o useState para usar o tipo correto:
const ChatApp: React.FC<IChatAppProps> = () => {
  // Use ISiteUser (o tipo correto para usuários de site no PnPjs v3)
  const [users, setUsers] = React.useState<ISiteUser[]>([]); 
  const [loading, setLoading] = React.useState<boolean>(true);


  // Efeito para carregar a lista de usuários quando o componente é montado
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const sp = getSP(); 
        
        
        if (!sp) {
            console.warn("PnPjs não inicializado.");
            return;
        }

        const siteUsers: ISiteUser[] = await sp.web.siteUsers.select("Id", "Title", "Email")(); // O .get() é substituído por ()
        setUsers(siteUsers);
        setUsers(siteUsers);
        
      } catch (e) {
        console.error("Erro ao carregar dados do SharePoint:", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <Stack tokens={{ childrenGap: 15 }} styles={{ root: { border: '1px solid #ccc', padding: 15, borderRadius: 4, height: '600px' } }}>
      <Text variant="large" styles={{ root: { fontWeight: 'bold' } }}>
        💬 Webpart de Mensagens (Chat)
      </Text>
      <Separator />

      {loading && <Text>Carregando dados do SharePoint...</Text>}
      {!loading && (
        <Stack tokens={{ childrenGap: 10 }}>
          {/* PROVA DE CONEXÃO: Se este número aparecer, o PnPjs está perfeito. */}
          <Text variant="medium">
            **Total de Usuários carregados para menção (@): {users.length}**
          </Text>
          
          <div style={{ flexGrow: 1, overflowY: 'auto', border: '1px solid #eee', padding: 10 }}>
            {/* Aqui será onde as mensagens serão exibidas */}
            <Text>Área de Mensagens Vazia.</Text>
          </div>

          <PrimaryButton text="Enviar Mensagem" />
        </Stack>
      )}
    </Stack>
  );
};

export default ChatApp;