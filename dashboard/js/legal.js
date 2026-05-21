/* ─────────────────────────────────────────────────────────────────
   MacroDash — Legal documents (Terms of Use + Privacy Policy)
   Rendered as modal dialogs, opened from the sidebar footer.
   Content adapted for "Macro Dashboards — um produto Macro Panorama".
   ───────────────────────────────────────────────────────────────── */

const LEGAL_DOCS = {
  terms: {
    title: 'Termos de Uso',
    sections: [
      {
        h: '1. Aceitação dos Termos',
        html: `Ao acessar ou utilizar a plataforma <strong>Macro Dashboards</strong> ("Plataforma"), você ("Usuário") declara ter lido, compreendido e concordado com estes Termos de Uso e com a Política de Privacidade. Caso não concorde, interrompa imediatamente o uso. Estes Termos são regidos pelo Código Civil Brasileiro (Lei nº 10.406/2002), pelo Marco Civil da Internet (Lei nº 12.965/2014) e demais legislações aplicáveis.`
      },
      {
        h: '2. Descrição do Serviço',
        html: `O Macro Dashboards é uma plataforma digital de monitoramento e visualização de dados financeiros e macroeconômicos, oferecida em planos de acesso (Basic e Pro) com funcionalidades distintas descritas no site.`
      },
      {
        h: '3. Cadastro e Conta',
        html: `3.1. O acesso requer cadastro com informações verdadeiras, precisas e atualizadas.<br>
3.2. O Usuário é integralmente responsável pela confidencialidade de suas credenciais.<br>
3.3. Uso não autorizado deve ser comunicado imediatamente a suporte.macropanorama@gmail.com.<br>
3.4. O Macro Dashboards pode suspender contas que violem estes Termos sem aviso prévio.`
      },
      {
        h: '4. Planos e Pagamentos',
        html: `4.1. Os planos e valores vigentes estão disponíveis no site.<br>
4.2. Cancelamentos devem ser solicitados com 24h de antecedência do próximo período de cobrança.<br>
4.3. Reembolsos seguirão as condições acordadas no momento da contratação.`
      },
      {
        h: '5. Aviso sobre Informações Financeiras',
        html: `5.1. Todos os dados disponibilizados têm caráter meramente <strong>informativo e educacional</strong>.<br>
5.2. Nenhum conteúdo da Plataforma constitui recomendação de investimento, assessoria financeira ou oferta de compra/venda de valores mobiliários.<br>
5.3. Dados de mercado podem apresentar atraso de até 15 (quinze) minutos.<br>
5.4. O Macro Dashboards não se responsabiliza por quaisquer decisões financeiras baseadas no uso da Plataforma.<br>
5.5. Consulte profissionais de investimentos habilitados antes de tomar qualquer decisão financeira.`
      },
      {
        h: '6. Propriedade Intelectual',
        html: `6.1. Todo o conteúdo da Plataforma — incluindo código-fonte, design, textos, logotipos e dados — é propriedade do Macro Dashboards / Macro Panorama ou de seus licenciantes, protegido pela Lei nº 9.610/1998.<br>
6.2. É vedada qualquer reprodução, distribuição, modificação ou exploração comercial sem autorização prévia e escrita.<br>
6.3. O uso da Plataforma não transfere ao Usuário qualquer direito de propriedade intelectual.`
      },
      {
        h: '7. Restrições de Uso',
        html: `É expressamente proibido ao Usuário:
<ul>
  <li>Utilizar a Plataforma para fins ilícitos, fraudulentos ou contrários à moral;</li>
  <li>Realizar acesso automatizado por bots, scrapers ou scripts sem autorização escrita;</li>
  <li>Tentar contornar mecanismos de autenticação ou segurança;</li>
  <li>Compartilhar credenciais de acesso com terceiros;</li>
  <li>Utilizar dados da Plataforma para criar produtos ou serviços concorrentes.</li>
</ul>`
      },
      {
        h: '8. Limitação de Responsabilidade',
        html: `8.1. O Macro Dashboards não garante disponibilidade ininterrupta dos serviços.<br>
8.2. Em nenhuma hipótese será responsável por danos indiretos, lucros cessantes, perda de dados ou prejuízos financeiros decorrentes do uso ou impossibilidade de uso da Plataforma.<br>
8.3. A responsabilidade total, quando reconhecida, não excederá o valor pago pelo Usuário nos 3 (três) meses anteriores ao evento.`
      },
      {
        h: '9. Suspensão e Rescisão',
        html: `O Macro Dashboards poderá suspender ou encerrar o acesso do Usuário a qualquer momento, mediante notificação por e-mail, em caso de violação destes Termos ou por razões técnicas e operacionais.`
      },
      {
        h: '10. Modificações dos Termos',
        html: `Estes Termos podem ser alterados a qualquer momento. Alterações relevantes serão comunicadas com no mínimo 10 (dez) dias de antecedência por e-mail ou aviso na Plataforma. O uso continuado após a publicação implica aceitação das novas condições.`
      },
      {
        h: '11. Lei Aplicável e Foro',
        html: `Estes Termos são regidos exclusivamente pelas leis da República Federativa do Brasil. Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer controvérsias, com exclusão de qualquer outro, por mais privilegiado que seja.`
      },
    ]
  },

  privacy: {
    title: 'Política de Privacidade',
    intro: `Esta Política descreve como o <strong>Macro Dashboards</strong> coleta, utiliza, armazena e protege seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados Pessoais — LGPD (Lei nº 13.709/2018) e demais normas aplicáveis.`,
    sections: [
      {
        h: '1. Controlador dos Dados',
        html: `O Macro Dashboards é a controladora responsável pelo tratamento dos dados pessoais coletados nesta Plataforma. Contato: <strong>suporte.macropanorama@gmail.com</strong>.`
      },
      {
        h: '2. Dados Pessoais Coletados',
        html: `<ul>
  <li><strong>Dados de cadastro:</strong> nome e endereço de e-mail;</li>
  <li><strong>Credenciais:</strong> senha armazenada exclusivamente em formato de hash criptográfico (nunca em texto claro);</li>
  <li><strong>Dados de uso:</strong> logs de acesso, histórico de navegação na Plataforma e preferências do usuário;</li>
  <li><strong>Dados técnicos:</strong> endereço IP, tipo de navegador, sistema operacional, data e hora de acesso.</li>
</ul>`
      },
      {
        h: '3. Finalidade do Tratamento',
        html: `<ul>
  <li>Prestação, manutenção e melhoria dos serviços da Plataforma;</li>
  <li>Autenticação e controle de acesso;</li>
  <li>Comunicação sobre atualizações, novidades e suporte técnico;</li>
  <li>Cumprimento de obrigações legais e regulatórias;</li>
  <li>Prevenção de fraudes e segurança da Plataforma.</li>
</ul>`
      },
      {
        h: '4. Base Legal (Art. 7º da LGPD)',
        html: `<ul>
  <li><strong>Execução de contrato</strong> (art. 7º, V): para prestação dos serviços contratados;</li>
  <li><strong>Legítimo interesse</strong> (art. 7º, IX): para segurança e melhoria contínua da Plataforma;</li>
  <li><strong>Obrigação legal</strong> (art. 7º, II): quando exigido por lei ou autoridade competente;</li>
  <li><strong>Consentimento</strong> (art. 7º, I): para comunicações de marketing, mediante opt-in explícito.</li>
</ul>`
      },
      {
        h: '5. Retenção de Dados',
        html: `Os dados pessoais são conservados pelo tempo necessário para as finalidades descritas. Dados de conta são retidos durante a vigência do contrato e por até 5 (cinco) anos após o encerramento, para fins de obrigações legais (art. 16, LGPD).`
      },
      {
        h: '6. Compartilhamento de Dados',
        html: `Não vendemos, alugamos ou comercializamos seus dados pessoais. Compartilhamos apenas com:
<ul>
  <li><strong>Provedores de infraestrutura</strong> (nuvem, hospedagem): estritamente necessário para o funcionamento;</li>
  <li><strong>Autoridades públicas:</strong> mediante determinação legal, judicial ou regulatória.</li>
</ul>`
      },
      {
        h: '7. Direitos do Titular (Art. 18 da LGPD)',
        html: `Você tem direito a: confirmação da existência de tratamento; acesso aos dados; correção de dados inexatos; anonimização, bloqueio ou eliminação de dados desnecessários; portabilidade; eliminação de dados tratados com consentimento; informação sobre compartilhamento; e revogação do consentimento a qualquer momento.<br><br>
Para exercer seus direitos, contate: <strong>suporte.macropanorama@gmail.com</strong>. Responderemos em até 15 dias corridos.`
      },
      {
        h: '8. Cookies e Tecnologias Similares',
        html: `Utilizamos exclusivamente cookies de sessão estritamente necessários para autenticação. Não utilizamos cookies de rastreamento de terceiros para fins publicitários. A desabilitação de cookies pode impedir o funcionamento correto da Plataforma.`
      },
      {
        h: '9. Segurança dos Dados',
        html: `Adotamos: hash criptográfico (bcrypt) para senhas; conexões via HTTPS/TLS; controle de acesso baseado em funções (RBAC); e monitoramento contínuo de segurança. Em caso de incidente, notificaremos os titulares e a ANPD nos prazos estabelecidos pela LGPD.`
      },
      {
        h: '10. Transferência Internacional de Dados',
        html: `Seus dados poderão ser processados em servidores fora do Brasil (provedores de nuvem internacionais). Garantimos que essas transferências ocorrem com salvaguardas adequadas, conforme art. 33 da LGPD.`
      },
      {
        h: '11. Encarregado de Dados (DPO)',
        html: `Nosso Encarregado de Proteção de Dados pode ser contactado por: <strong>suporte.macropanorama@gmail.com</strong>.`
      },
      {
        h: '12. Alterações nesta Política',
        html: `Esta Política poderá ser atualizada periodicamente. Alterações relevantes serão comunicadas com antecedência mínima de 10 (dez) dias por e-mail ou aviso na Plataforma.`
      },
    ]
  },
};

/**
 * Open a legal document modal ('terms' | 'privacy').
 */
function showLegalModal(type) {
  const doc = LEGAL_DOCS[type];
  if (!doc) return;

  // Remove any existing legal modal
  const existing = document.querySelector('.legal-overlay');
  if (existing) existing.remove();

  const sectionsHTML = doc.sections.map(s => `
    <section class="legal-section">
      <h4>${s.h}</h4>
      <div class="legal-text">${s.html}</div>
    </section>
  `).join('');

  const overlay = document.createElement('div');
  overlay.className = 'legal-overlay';
  overlay.innerHTML = `
    <div class="legal-modal" role="dialog" aria-modal="true" aria-label="${doc.title}">
      <div class="legal-header">
        <h3>${doc.title}</h3>
        <button class="legal-close" aria-label="Fechar">×</button>
      </div>
      <div class="legal-body">
        ${doc.intro ? `<div class="legal-intro">${doc.intro}</div>` : ''}
        ${sectionsHTML}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => {
    overlay.remove();
    document.removeEventListener('keydown', escHandler);
  };
  const escHandler = (ev) => { if (ev.key === 'Escape') close(); };

  overlay.addEventListener('click', (ev) => { if (ev.target === overlay) close(); });
  overlay.querySelector('.legal-close').addEventListener('click', close);
  document.addEventListener('keydown', escHandler);
}
