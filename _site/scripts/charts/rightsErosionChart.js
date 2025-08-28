const chartVars = getComputedStyle(document.body);

const accent = chartVars.getPropertyValue('--text-accent').trim();
const highlight = chartVars.getPropertyValue('--highlight').trim();
const strongText = chartVars.getPropertyValue('--strong-text').trim();
const shadowGlow = chartVars.getPropertyValue('--shadow-glow').trim();

const ctx = document.getElementById('rightsErosionChart').getContext('2d');

new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['1980', '1986', '2000', '2001', '2003', '2008', '2012', '2016', '2022', '2023', '2025', '2026'],
    datasets: [{
      label: 'Cumulative Restrictive Laws',
      data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      borderColor: accent,
      backgroundColor: accent + '66',
      fill: false,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: accent
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Timeline of Rights Erosion in the UK (1986–2025)',
        color: strongText,
        font: ctx => ({
          size: ctx.chart.width < 400 ? 10 : ctx.chart.width < 768 ? 12 : 14,
          family: 'Arial'
        })
      },
      legend: {
        labels: {
          color: strongText,
          font: ctx => ({
            size: ctx.chart.width < 400 ? 9 : 11
          })
        }
      },
      annotation: {
        annotations: [
          { xValue: '1986', yValue: 1, content: ['Ritual suppression', 'of collective voice'] },
          { xValue: '2000', yValue: 2, content: ['Fear-based', 'surveillance of dissent'] },
          { xValue: '2001', yValue: 3, content: ['Normalisation of', 'fear-based imprisonment'] },
          { xValue: '2003', yValue: 4, content: ['Collapse of', 'presumption of innocence'] },
          { xValue: '2008', yValue: 5, content: ['Truth hidden', 'behind legal veils'] },
          { xValue: '2012', yValue: 6, content: ['Access to truth', 'became a privilege'] },
          { xValue: '2016', yValue: 7, content: ['Sanctification of', 'the Watcher State'] },
          { xValue: '2022', yValue: 8, content: ['Banishing the', 'right to resist'] },
          { xValue: '2023', yValue: 9, content: ['Excommunication of', 'conscience'] },
          { xValue: '2025', yValue: 10, content: ['Final inversion:', 'good becomes evil'] }
        ].map((label, index) => ({
          type: 'label',
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          color: strongText,
          font: ctx => ({
            size: ctx.chart.width < 400 ? 7 : 9
          }),
          yAdjust: index % 2 === 0 ? -20 : 20,
          ...label
        }))
      }
    },
    layout: {
      padding: { top: 20 }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Year',
          color: strongText,
          font: ctx => ({
            size: ctx.chart.width < 400 ? 9 : 12
          })
        },
        grid: { color: shadowGlow },
        ticks: {
          color: strongText,
          font: ctx => ({
            size: ctx.chart.width < 400 ? 8 : 10
          })
        }
      },
      y: {
        display: ctx => ctx.chart.width >= 600,
        title: {
          display: ctx => ctx.chart.width >= 600,
          text: 'Cumulative Restrictive Laws',
          color: strongText,
          font: ctx => ({
            size: ctx.chart.width < 400 ? 9 : 12
          })
        },
        beginAtZero: true,
        grid: {
          display: ctx => ctx.chart.width >= 600,
          color: shadowGlow
        },
        ticks: {
          display: ctx => ctx.chart.width >= 600,
          color: strongText,
          font: ctx => ({
            size: ctx.chart.width < 400 ? 8 : 10
          })
        }
      }
    }
  }
});
