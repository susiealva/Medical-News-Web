// Simula un endpoint de análisis de noticias médicas para el chatbot
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const { query } = req.body;
  // Respuesta simulada
  res.status(200).json({
    results: [
      {
        title: 'Nueva terapia genética para enfermedades raras',
        summary: 'Investigadores han desarrollado una terapia genética prometedora para tratar enfermedades raras que antes no tenían cura.',
        url: 'https://ejemplo.com/noticia1'
      },
      {
        title: 'Avances en inteligencia artificial médica',
        summary: 'La IA está revolucionando el diagnóstico y tratamiento de enfermedades complejas en hospitales de todo el mundo.',
        url: 'https://ejemplo.com/noticia2'
      },
      {
        title: 'Vacunas personalizadas: el futuro de la inmunización',
        summary: 'Científicos exploran vacunas personalizadas basadas en el perfil genético de cada paciente.',
        url: 'https://ejemplo.com/noticia3'
      }
    ]
  });
}
