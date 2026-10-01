-- ============================================================
-- Fluency Vitrine — Seed Data: Babilônica Joias
-- Execute após o schema.sql no SQL Editor do Supabase
-- Joias em aço inox 316L hipoalergênico — Piraju, SP
-- ============================================================

insert into products (name, description, price, category, images, active, sort_order) values
  (
    'Colar Ishtar',
    'Colar longo com pingente geométrico em aço inox 316L. 70 cm. Hipoalergênico, resiste à água e ao suor.',
    89.90, 'Colares', '{}', true, 1
  ),
  (
    'Colar Onça',
    'Colar curto com corrente mista e pingente animal print em aço inox. Antialérgico, não escurece.',
    74.90, 'Colares', '{}', true, 2
  ),
  (
    'Colar Plêiades',
    'Conjunto de três correntes finas sobrepostas em aço inox escovado. Leveza máxima, inox grau cirúrgico.',
    69.90, 'Colares', '{}', true, 3
  ),
  (
    'Anel Lua',
    'Anel aberto ajustável com detalhe crescente lunar em aço inox 316L. Hipoalergênico, tamanho único.',
    44.90, 'Anéis', '{}', true, 4
  ),
  (
    'Anel Tigre',
    'Anel largo texturizado em aço inox escovado, inspirado em padrão natural. Resistente, antialérgico.',
    54.90, 'Anéis', '{}', true, 5
  ),
  (
    'Brinco Medusa',
    'Brinco de argola em aço inox com detalhe de argola fechada. Solda protegida, não oxida. Hipoalergênico.',
    59.90, 'Brincos', '{}', true, 6
  ),
  (
    'Brinco Star',
    'Brinco ear cuff estrela em aço inox com zircônia. Sem furo, pressão lateral. Leveza máxima.',
    49.90, 'Brincos', '{}', true, 7
  ),
  (
    'Pulseira Nômade',
    'Pulseira de elos quadrados em aço inox escovado. Fecho de lagosta. Inox 316L grau cirúrgico, não escurece.',
    64.90, 'Pulseiras', '{}', true, 8
  ),
  (
    'Pulseira Orion',
    'Pulseira rígida com marcações em relevo em aço inox polido. Unissex. Hipoalergênico, resistente à oxidação.',
    79.90, 'Pulseiras', '{}', true, 9
  ),
  (
    'Kit Selvagem',
    'Colar Ishtar + Brinco Star em aço inox. Embalagem presente Babilônica. 5% de desconto no Pix.',
    129.90, 'Kits', '{}', true, 10
  ),
  (
    'Kit Babilônica',
    'Conjunto completo: colar + anel + brincos em aço inox coordenados. Embalagem premium. 5% desconto no Pix.',
    189.90, 'Kits', '{}', true, 11
  );

-- Confirma configurações da loja
update settings set
  name      = 'Babilônica',
  tagline   = 'Joias em Aço Inox · Peças Autorais · Curadoria Ancestral',
  whatsapp  = '5511956522793',
  city      = 'Piraju — SP',
  currency  = 'R$',
  instagram = 'https://www.instagram.com/babilonica7/'
where id = 1;
