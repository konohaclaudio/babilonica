import config from '../config'

const GITHUB  = 'https://github.com/konohaclaudio/babilonica'
const VERCEL  = 'https://babilonica-vitrine.vercel.app'
const STORE   = VERCEL
const ADMIN   = `${STORE}/login`

const Section = ({ id, label, children }) => (
  <section className="manual-section" id={id}>
    <div className="manual-section__label">{label}</div>
    {children}
  </section>
)

const Block = ({ title, children }) => (
  <div className="manual-block">
    {title && <h3 className="manual-block__title">{title}</h3>}
    {children}
  </div>
)

const Credential = ({ label, value, mono }) => (
  <div className="manual-credential">
    <span className="manual-credential__label">{label}</span>
    <span className={`manual-credential__value${mono ? ' mono' : ''}`}>{value}</span>
  </div>
)

const Step = ({ n, title, children }) => (
  <div className="manual-step">
    <div className="manual-step__num">{n}</div>
    <div className="manual-step__body">
      <div className="manual-step__title">{title}</div>
      <div className="manual-step__text">{children}</div>
    </div>
  </div>
)

const Tag = ({ children }) => <span className="manual-tag">{children}</span>

export default function Manual() {
  return (
    <div className="manual-page">

      {/* TOPO */}
      <header className="manual-header">
        <div className="manual-header__brand">
          <img src="/logo.jpeg" alt="Babilônica" className="manual-header__logo" />
        </div>
        <div className="manual-header__meta">
          <div className="manual-header__product">Manual do Sistema</div>
          <div className="manual-header__by">
            Desenvolvido por <strong>Claudio Santana</strong> · Fluency Works
          </div>
          <div className="manual-header__date">Outubro 2026</div>
        </div>
      </header>

      <div className="manual-body">

        {/* 01 — SOBRE O PRODUTO */}
        <Section id="produto" label="01 · O Sistema">
          <Block>
            <p className="manual-text">
              A <strong>Babilônica Vitrine</strong> é uma loja online completa desenvolvida pela
              Fluency Works especialmente para a Babilônica Joias. O sistema permite que as clientes
              naveguem pelo catálogo, adicionem peças à sacola e finalizem o pedido diretamente
              pelo WhatsApp — sem intermediários e sem comissão.
            </p>
            <p className="manual-text">
              O painel administrativo permite gerenciar produtos, acompanhar pedidos, organizar
              categorias e configurar a identidade da loja — tudo pelo celular ou computador.
            </p>
            <div className="manual-tags">
              <Tag>Vitrine online</Tag>
              <Tag>Sacola + Checkout WhatsApp</Tag>
              <Tag>Painel Admin</Tag>
              <Tag>Upload de fotos</Tag>
              <Tag>Sem comissão</Tag>
            </div>
          </Block>
        </Section>

        {/* 02 — ACESSO */}
        <Section id="acesso" label="02 · Acesso ao Sistema">
          <Block title="Loja (clientes)">
            <Credential label="Endereço da loja" value={STORE} mono />
          </Block>

          <Block title="Painel Administrativo (Babi)">
            <Credential label="URL do admin"  value={ADMIN} mono />
            <Credential label="Email"         value="babi@babilonica.com" mono />
            <Credential label="Senha"         value="123456" mono />
            <div className="manual-notice">
              Guarde estas credenciais em lugar seguro.
              Em produção, a senha pode ser alterada no painel do Supabase em{' '}
              <span className="mono">Authentication → Users</span>.
            </div>
          </Block>
        </Section>

        {/* 03 — COMO USAR */}
        <Section id="uso" label="03 · Como Usar o Painel Admin">

          <Block title="Entrar no sistema">
            <Step n="1" title="Abra o link do admin">
              Acesse <span className="mono">{ADMIN}</span> pelo celular ou computador.
            </Step>
            <Step n="2" title="Digite as credenciais">
              Email: <span className="mono">babi@babilonica.com</span> · Senha: <span className="mono">123456</span>
            </Step>
            <Step n="3" title="Clique em Entrar">
              Você será redirecionada ao painel com as seções: Catálogo, Rituais, Categorias e Alquimia.
            </Step>
          </Block>

          <Block title="Cadastrar um produto">
            <Step n="1" title="Vá em Catálogo">
              No menu superior, selecione <strong>Catálogo</strong>.
            </Step>
            <Step n="2" title="Clique em + Nova Formulação">
              Abre o formulário de cadastro.
            </Step>
            <Step n="3" title="Preencha os dados">
              Nome, preço, categoria e descrição. O sistema aceita até 3 fotos por produto.
            </Step>
            <Step n="4" title="Adicione fotos">
              Clique em cada slot de foto para fazer upload direto do celular. Formatos aceitos: JPG, PNG, WebP (máx. 4 MB cada).
            </Step>
            <Step n="5" title="Clique em Adicionar produto">
              O produto aparece imediatamente no catálogo da loja.
            </Step>
          </Block>

          <Block title="Acompanhar pedidos">
            <Step n="1" title="Vá em Rituais">
              Todos os pedidos recebidos aparecem aqui com nome, telefone, itens e total.
            </Step>
            <Step n="2" title="Atualize o status">
              Clique no status do pedido: <span className="mono">Novo → Confirmado → Entregue</span>.
            </Step>
            <Step n="3" title="Entre em contato">
              O número de WhatsApp da cliente está no pedido. Clique para abrir a conversa.
            </Step>
          </Block>

          <Block title="Configurar a loja (Alquimia)">
            <Step n="1" title="Vá em Alquimia">
              Configurações gerais da loja.
            </Step>
            <Step n="2" title="Atualize nome, tagline, cidade, WhatsApp">
              Qualquer alteração aqui atualiza a loja automaticamente após salvar.
            </Step>
            <Step n="3" title="Troque o logotipo">
              Faça upload de uma nova imagem ou cole a URL de uma imagem online.
            </Step>
          </Block>

          <Block title="Gerenciar categorias">
            <Step n="1" title="Vá em Categorias">
              Categorias organizam o filtro no catálogo da loja.
            </Step>
            <Step n="2" title="Adicione uma nova categoria">
              Digite o nome e pressione Enter ou clique em + Adicionar.
            </Step>
            <Step n="3" title="Remova categorias desnecessárias">
              Os produtos continuam cadastrados — apenas o filtro some.
            </Step>
          </Block>
        </Section>

        {/* 04 — INFRAESTRUTURA */}
        <Section id="infra" label="04 · Infraestrutura Técnica">
          <Block title="Hospedagem e código">
            <Credential label="Hospedagem (loja)"    value="Vercel — gratuito, deploy automático" />
            <Credential label="Código-fonte"          value={GITHUB} mono />
            <Credential label="Conta GitHub"          value="konohaclaudio" mono />
            <Credential label="Repositório"           value="babilonica (privado)" />
          </Block>

          <Block title="Banco de dados e arquivos">
            <Credential label="Plataforma"  value="Supabase (PostgreSQL + Storage)" />
            <Credential label="Organização" value="BabilonicaJoias" />
            <Credential label="Projeto"     value="babilonica-vitrine" />
            <Credential label="Região"      value="South America (São Paulo)" />
            <div className="manual-notice">
              As chaves de acesso ao Supabase ficam nas variáveis de ambiente do Vercel
              (<span className="mono">VITE_SUPABASE_URL</span> e <span className="mono">VITE_SUPABASE_ANON_KEY</span>).
              Nunca compartilhe a <span className="mono">SERVICE_KEY</span>.
            </div>
          </Block>

          <Block title="Stack tecnológica">
            <div className="manual-stack">
              <div className="manual-stack-item">
                <div className="manual-stack-item__name">React 18 + Vite</div>
                <div className="manual-stack-item__desc">Interface da loja e do admin</div>
              </div>
              <div className="manual-stack-item">
                <div className="manual-stack-item__name">Supabase</div>
                <div className="manual-stack-item__desc">Banco PostgreSQL · Storage de imagens · Autenticação</div>
              </div>
              <div className="manual-stack-item">
                <div className="manual-stack-item__name">Vercel</div>
                <div className="manual-stack-item__desc">Hosting estático com deploy automático ao commitar no GitHub</div>
              </div>
              <div className="manual-stack-item">
                <div className="manual-stack-item__name">GitHub</div>
                <div className="manual-stack-item__desc">Versionamento e integração com Vercel</div>
              </div>
              <div className="manual-stack-item">
                <div className="manual-stack-item__name">WhatsApp</div>
                <div className="manual-stack-item__desc">Canal de checkout — pedidos chegam direto no +55 11 95652-2793</div>
              </div>
            </div>
          </Block>
        </Section>

        {/* 05 — SUPORTE */}
        <Section id="suporte" label="05 · Suporte e Contato">
          <Block>
            <p className="manual-text">
              Este sistema é um produto <strong>Fluency Works</strong> — presença digital própria
              para quem constrói algo real. Qualquer dúvida, ajuste ou melhoria entre em contato:
            </p>
            <Credential label="Desenvolvedor"  value="Claudio Santana" />
            <Credential label="Email"          value="csantana.gon@gmail.com" mono />
            <Credential label="WhatsApp"       value="+55 14 96373-527" mono />
            <Credential label="Empresa"        value="Fluency Works" />
          </Block>

          <Block title="Como solicitar alterações">
            <Step n="1" title="Entre em contato pelo WhatsApp ou email">
              Descreva o que precisa mudar — produto, texto, foto, cor, funcionalidade.
            </Step>
            <Step n="2" title="Claudio aplica a alteração">
              A maioria dos ajustes é feita em menos de 24h.
            </Step>
            <Step n="3" title="A loja é atualizada automaticamente">
              Após o deploy no Vercel, a alteração entra em vigor sem precisar fazer nada.
            </Step>
          </Block>
        </Section>

      </div>

      {/* RODAPÉ */}
      <footer className="manual-footer">
        <div className="manual-footer__left">
          {config.store.name} · {config.store.city}
        </div>
        <div className="manual-footer__center">
          Fluency Works · Produto Digital Próprio
        </div>
        <div className="manual-footer__right">
          fluencyworks.com.br
        </div>
      </footer>

    </div>
  )
}
