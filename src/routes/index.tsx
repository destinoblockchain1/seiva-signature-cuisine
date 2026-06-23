<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SEIVA Gastronomy</title>
    
    <!-- 1. Preconnect para fontes (apenas o necessário) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <!-- 2. CSS com font-display: swap para evitar bloqueio de renderização -->
    <style>
        @font-face {
            font-family: 'SuaFonte';
            src: url('/fonts/sua-fonte.woff2') format('woff2');
            font-display: swap;
        }

        /* Garantir que elementos não causem shift */
        img {
            max-width: 100%;
            display: block;
            height: auto;
        }
    </style>
</head>
<body>

    <header>
        <!-- Logo com dimensões explícitas para evitar CLS (Cumulative Layout Shift) -->
        <!-- Mantive o fetchpriority e o decoding como recomendado pelo PSI -->
        <img 
            src="/assets/logo%20seiva-Bbo0ciJe.webp" 
            alt="SEIVA Logo" 
            width="1536" 
            height="1024" 
            fetchpriority="high" 
            decoding="sync" 
            class="h-72 md:h-[24rem] max-h-[35vh] opacity-40 w-auto object-contain">
    </header>

    <main>
        <!-- Envolver conteúdo em <main> resolve o erro de acessibilidade -->
        
        <section>
            <!-- Imagem do detalhe com width/height para reservar o espaço -->
            <img 
                src="/assets/IMG_7088-DqdOQzY7.webp" 
                alt="SEIVA Gastronomy - Cucumber Ribbon Presentation Detail" 
                loading="lazy" 
                width="3024" 
                height="1890"
                class="transition-all duration-1000 ease-out transform h-full w-full object-cover">
        </section>

        <section>
            <!-- Imagem dos chefs com width/height -->
            <img 
                src="/assets/chefs-collective-DfWIdaVq.webp" 
                alt="The three chefs of SEIVA: Bernardo Simões, Juliana Redoi, Tobia Messa" 
                loading="lazy" 
                width="1448" 
                height="1086"
                class="transition-all duration-1000 ease-out transform h-auto w-full block">
        </section>
    </main>

    <footer>
        <!-- Rodapé -->
    </footer>

</body>
</html>
