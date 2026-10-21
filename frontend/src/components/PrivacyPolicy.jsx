import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#fff8f4] text-[#211a14] py-12 px-4 sm:px-8 max-w-4xl mx-auto font-sans">
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#d4c3b5] shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-[#f7ede5] pb-6">
          <img src="/logo.png" alt="Biscoitossauro" className="w-16 h-16 object-contain" />
          <div>
            <h1 className="text-2xl font-extrabold text-[#211a14]">Política de Privacidade</h1>
            <p className="text-xs text-[#715b41]">Portal Administrativo Biscoitossauro • admin.biscoitossauro.com</p>
          </div>
        </div>

        <section className="space-y-3 text-sm text-[#50453a] leading-relaxed">
          <h2 className="text-base font-bold text-[#211a14]">1. Informações Gerais</h2>
          <p>
            A presente Política de Privacidade descreve como a <strong>Biscoitossauro</strong> coleta, utiliza e protege as informações obtidas por meio de sua plataforma de gestão interna (admin.biscoitossauro.com) e integrações com terceiros, incluindo a Meta Platforms (Instagram Graph API).
          </p>
        </section>

        <section className="space-y-3 text-sm text-[#50453a] leading-relaxed">
          <h2 className="text-base font-bold text-[#211a14]">2. Integração com a API do Instagram (Meta)</h2>
          <p>
            Nosso aplicativo solicita acesso estritamente de leitura (read-only) às métricas públicas e de desempenho da conta corporativa própria <code>@biscoitossauros</code>, tais como alcance, impressões, número de curtidas, salvamentos e comentários de publicações.
          </p>
          <p>
            Nenhum dado pessoal de terceiros ou seguidores é comercializado, transferido ou utilizado para finalidades externas. Os dados destinam-se exclusivamente ao monitoramento operacional de marketing da Biscoitossauro.
          </p>
        </section>

        <section className="space-y-3 text-sm text-[#50453a] leading-relaxed">
          <h2 className="text-base font-bold text-[#211a14]">3. Armazenamento e Segurança dos Dados</h2>
          <p>
            Todas as chaves de acesso e identificadores de integração são transmitidos via conexão criptografada (SSL/HTTPS) e armazenados em servidores protegidos.
          </p>
        </section>

        <section className="space-y-3 text-sm text-[#50453a] leading-relaxed">
          <h2 className="text-base font-bold text-[#211a14]">4. Exclusão de Dados</h2>
          <p>
            A qualquer momento, a conexão com a Meta pode ser revogada pelo painel de controle ou através das configurações de aplicativos da Meta. Para solicitar a exclusão definitiva de registros, envie um e-mail para <code>biscoitossauros@gmail.com</code>.
          </p>
        </section>

        <section className="space-y-3 text-sm text-[#50453a] leading-relaxed">
          <h2 className="text-base font-bold text-[#211a14]">5. Contato</h2>
          <p>
            Em caso de dúvidas sobre esta política, entre em contato pelo e-mail: <strong>biscoitossauros@gmail.com</strong>.
          </p>
        </section>

        <div className="pt-6 border-t border-[#f7ede5] text-xs text-[#715b41]">
          Última atualização: Outubro de 2026.
        </div>
      </div>
    </div>
  );
}
