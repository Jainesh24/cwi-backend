const OpenAI = require('openai');
const Baseline = require('../models/Baseline');
const WasteEntry = require('../models/WasteEntry');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class AIAnalysisService {
  
  /**
   * Calculate risk score based on waste parameters
   */
  async calculateRiskScore(wasteData, baseline, historicalData) {
    let riskScore = 0;
    const factors = [];

    // Factor 1: Quantity vs Expected (40 points)
    if (baseline) {
      const quantityRatio = (wasteData.quantity / baseline.expectedDaily) * 100;
      if (quantityRatio > 150) {
        riskScore += 40;
        factors.push(`Quantity is ${quantityRatio.toFixed(0)}% of expected baseline`);
      } else if (quantityRatio > 120) {
        riskScore += 25;
        factors.push(`Quantity is ${quantityRatio.toFixed(0)}% of expected baseline`);
      } else if (quantityRatio > 100) {
        riskScore += 10;
      }
    } else {
      riskScore += 20; // No baseline established
      factors.push('No baseline data available for this department');
    }

    // Factor 2: Waste Type Risk (30 points)
    const wasteTypeRisk = {
      'Infectious': 30,
      'Radioactive': 28,
      'Chemical': 25,
      'Pharmaceutical': 20,
      'Sharps': 25,
      'General': 5,
      'Recyclable': 0
    };
    riskScore += wasteTypeRisk[wasteData.wasteType] || 0;
    
    if (wasteTypeRisk[wasteData.wasteType] >= 20) {
      factors.push(`High-risk waste type: ${wasteData.wasteType}`);
    }

    // Factor 3: Disposal Method Appropriateness (20 points)
    const inappropriateDisposal = this.checkDisposalMethod(wasteData.wasteType, wasteData.disposalMethod);
    if (inappropriateDisposal) {
      riskScore += 20;
      factors.push(inappropriateDisposal);
    }

    // Factor 4: Procedure vs Waste Match (10 points)
    const procedureRisk = this.assessProcedureRisk(wasteData);
    riskScore += procedureRisk.score;
    if (procedureRisk.reason) {
      factors.push(procedureRisk.reason);
    }

    // Cap at 100
    riskScore = Math.min(riskScore, 100);

    return { riskScore, factors };
  }

  /**
   * Check if disposal method is appropriate for waste type
   */
  checkDisposalMethod(wasteType, disposalMethod) {
    const appropriateMethods = {
      'Infectious': ['Incineration', 'Autoclave'],
      'Pharmaceutical': ['Incineration', 'Chemical Treatment', 'Special Handling'],
      'Sharps': ['Incineration', 'Autoclave', 'Special Handling'],
      'Chemical': ['Chemical Treatment', 'Incineration', 'Special Handling'],
      'Radioactive': ['Special Handling'],
      'General': ['Secure Landfill', 'Recycling'],
      'Recyclable': ['Recycling']
    };

    const appropriate = appropriateMethods[wasteType];
    if (appropriate && !appropriate.includes(disposalMethod)) {
      return `Disposal method "${disposalMethod}" may be inappropriate for ${wasteType} waste`;
    }
    return null;
  }

  /**
   * Assess procedure-specific risks
   */
  assessProcedureRisk(wasteData) {
    const highRiskProcedures = ['Major Surgery', 'Chemotherapy', 'Emergency Response'];
    const pediatricDept = wasteData.department === 'Pediatrics';
    
    let score = 0;
    let reason = null;

    if (highRiskProcedures.includes(wasteData.procedureCategory)) {
      if (wasteData.wasteType === 'Sharps' && wasteData.quantity > 5) {
        score = 10;
        reason = `High sharps volume in ${wasteData.procedureCategory}`;
      }
    }

    if (pediatricDept && wasteData.wasteType === 'Sharps') {
      score += 5;
      reason = reason ? reason + ' in pediatric setting' : 'Sharps in pediatric department';
    }

    return { score, reason };
  }

  /**
   * Generate AI-powered analysis using OpenAI
   */
  async generateAIAnalysis(wasteData, riskScore, factors, baseline) {
    try {
      const prompt = `You are a clinical waste management expert AI analyzing hospital waste data.

Waste Entry Details:
- Department: ${wasteData.department}
- Waste Type: ${wasteData.wasteType}
- Quantity: ${wasteData.quantity} kg
- Procedure: ${wasteData.procedureCategory}
- Disposal Method: ${wasteData.disposalMethod}
- Shift: ${wasteData.shift}
${wasteData.notes ? `- Notes: ${wasteData.notes}` : ''}

Risk Analysis:
- Risk Score: ${riskScore}/100
- Risk Factors: ${factors.join('; ')}
${baseline ? `- Expected Daily: ${baseline.expectedDaily} kg` : ''}

Task: Provide a concise analysis with:
1. Assessment: Brief evaluation (2-3 sentences)
2. Recommended Action: Specific actionable steps (2-3 bullet points)
3. Alert Message: Short alert message if risk score > 60

Format your response as JSON:
{
  "assessment": "...",
  "recommendedAction": "...",
  "alertMessage": "..." or null
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a clinical waste management expert. Provide concise, actionable insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      const aiResponse = JSON.parse(completion.choices[0].message.content);
      return aiResponse;

    } catch (error) {
      console.error('OpenAI API Error:', error);
      
      // Fallback analysis if API fails
      return this.generateFallbackAnalysis(wasteData, riskScore, factors);
    }
  }

  /**
   * Fallback analysis if OpenAI is unavailable
   */
  generateFallbackAnalysis(wasteData, riskScore, factors) {
    let assessment = '';
    let recommendedAction = '';
    let alertMessage = null;

    if (riskScore >= 70) {
      assessment = `High risk detected (${riskScore}/100) in ${wasteData.department}. ${factors[0] || 'Multiple risk factors identified'}. Immediate review required.`;
      recommendedAction = `• Review waste disposal protocols for ${wasteData.department}\n• Verify staff training on ${wasteData.wasteType} waste handling\n• Evaluate quantity against baseline standards`;
      alertMessage = `Potential Anomaly in ${wasteData.wasteType} Waste Generation`;
    } else if (riskScore >= 50) {
      assessment = `Moderate risk (${riskScore}/100) detected. ${factors[0] || 'Some concerns identified'}. Monitoring recommended.`;
      recommendedAction = `• Monitor waste trends over next 48 hours\n• Ensure proper segregation of ${wasteData.wasteType} waste\n• Consider staff refresher training`;
      alertMessage = null;
    } else {
      assessment = `Low risk (${riskScore}/100). Waste handling appears appropriate for ${wasteData.procedureCategory} in ${wasteData.department}.`;
      recommendedAction = `• Continue current protocols\n• Maintain proper documentation\n• Regular monitoring recommended`;
      alertMessage = null;
    }

    return { assessment, recommendedAction, alertMessage };
  }

  /**
   * Main analysis function
   */
  async analyzeWasteEntry(wasteData, organizationId) {
    try {
      // Get baseline for department
      const baseline = await Baseline.findOne({
        organizationId,
        department: wasteData.department
      });

      // Get historical data (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const historicalData = await WasteEntry.find({
        organizationId,
        department: wasteData.department,
        timestamp: { $gte: sevenDaysAgo }
      });

      // Calculate risk score
      const { riskScore, factors } = await this.calculateRiskScore(
        wasteData,
        baseline,
        historicalData
      );

      // Generate AI analysis
      const aiAnalysis = await this.generateAIAnalysis(
        wasteData,
        riskScore,
        factors,
        baseline
      );

      return {
        riskScore,
        anomalyDetected: riskScore >= 65,
        assessment: aiAnalysis.assessment,
        recommendedAction: aiAnalysis.recommendedAction,
        alertMessage: aiAnalysis.alertMessage
      };

    } catch (error) {
      console.error('Analysis Error:', error);
      throw error;
    }
  }
}

module.exports = new AIAnalysisService();
