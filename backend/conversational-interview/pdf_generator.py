import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY

from models import FullInterviewReport

def compile_report_pdf(report: FullInterviewReport, output_path: str) -> str:
    # Ensure directory exists
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Palette
    PRIMARY = colors.HexColor("#1e293b")      # Dark Slate
    ACCENT_BLUE = colors.HexColor("#2563eb")  # Royal Blue
    SUCCESS = colors.HexColor("#16a34a")      # Green
    WARNING = colors.HexColor("#d97706")      # Amber
    DANGER = colors.HexColor("#dc2626")       # Red
    LIGHT_BG = colors.HexColor("#f8fafc")     # Cool Off-White
    BORDER_COLOR = colors.HexColor("#e2e8f0") # Slate Border
    TEXT_MUTED = colors.HexColor("#64748b")   # Slate Gray
    
    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=PRIMARY
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=13,
        textColor=TEXT_MUTED
    )
    
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=PRIMARY,
        spaceBefore=12,
        spaceAfter=6
    )
    
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=PRIMARY
    )
    
    bold_rec_style = ParagraphStyle(
        'BoldRecStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#0f172a")
    )
    
    diag_style = ParagraphStyle(
        'DiagStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155")
    )

    story = []
    
    # --- HEADER ---
    header_data = [
        [
            Paragraph("<b>ROZGAR SARTHI</b><br/><font size=9 color='#64748b'>Adaptive Technical Assessment Engine</font>", title_style),
            Paragraph(f"<b>Session ID:</b> {report.session_id}<br/><b>Target Role:</b> {report.target_role}", subtitle_style)
        ]
    ]
    header_table = Table(header_data, colWidths=[320, 220])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (1,0), (1,0), 'RIGHT'),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=ACCENT_BLUE, spaceBefore=4, spaceAfter=12))
    
    # --- HIRING CALIBRATION BADGE ---
    rec = report.hiring_recommendation.upper()
    badge_color = SUCCESS if "STRONG" in rec or "HIRE" in rec and "NO" not in rec else (WARNING if "NEEDS" in rec else DANGER)
    
    calibration_data = [
        [
            Paragraph(f"<font color='white'><b>RECOMMENDATION: {rec}</b></font>", ParagraphStyle('Badge', fontName='Helvetica-Bold', fontSize=11, leading=14, alignment=TA_CENTER)),
            Paragraph(f"<b>Executive Assessment Summary:</b><br/>{report.executive_summary}", body_style)
        ]
    ]
    calibration_table = Table(calibration_data, colWidths=[180, 360])
    calibration_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), badge_color),
        ('BACKGROUND', (1,0), (1,0), LIGHT_BG),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(calibration_table)
    story.append(Spacer(1, 14))
    
    # --- 5-AXIS COMPETENCY SCORECARD ---
    story.append(Paragraph("<b>Competency Scorecard (0.0 — 1.0 Rating)</b>", section_heading))
    
    comp_rows = [["Competency Axis", "Score", "Performance Level"]]
    for comp_name, score in report.competencies.items():
        pretty_name = comp_name.replace("_", " ").title()
        score_fmt = f"{score:.2f}"
        
        if score >= 0.75:
            lvl = "<font color='#16a34a'><b>Strong (Demonstrated)</b></font>"
        elif score >= 0.50:
            lvl = "<font color='#d97706'><b>Moderate (Needs Precision)</b></font>"
        else:
            lvl = "<font color='#dc2626'><b>Low (Missing Evidence)</b></font>"
            
        comp_rows.append([pretty_name, score_fmt, Paragraph(lvl, body_style)])
        
    comp_table = Table(comp_rows, colWidths=[200, 80, 260])
    comp_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 9.5),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('TOPPADDING', (0,0), (-1,0), 6),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('ALIGN', (1,0), (1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(comp_table)
    story.append(Spacer(1, 14))
    
    # --- STRENGTHS & RISKS ---
    strengths_html = "<br/>".join([f"• {s}" for s in report.verified_strengths]) if report.verified_strengths else "• Basic engineering context"
    risks_html = "<br/>".join([f"• {r}" for r in report.critical_risks]) if report.critical_risks else "• Lack of quantified metrics"
    
    sr_data = [
        [
            Paragraph("<font color='#16a34a'><b>✅ Verified Strengths</b></font>", section_heading),
            Paragraph("<font color='#dc2626'><b>⚠️ Critical Risks & Red Flags</b></font>", section_heading)
        ],
        [
            Paragraph(strengths_html, body_style),
            Paragraph(risks_html, body_style)
        ]
    ]
    sr_table = Table(sr_data, colWidths=[265, 265])
    sr_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(sr_table)
    story.append(Spacer(1, 16))
    
    # --- PAGE 2: 2-TIER ACTIONABLE COACHING FEEDBACK CARDS ---
    story.append(PageBreak())
    story.append(Paragraph("<b>2-Tier Actionable Coaching Cards</b>", title_style))
    story.append(Paragraph("Prescriptive guidance with sample templates alongside contextual candidate response analysis.", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER_COLOR, spaceBefore=6, spaceAfter=12))
    
    for card in report.feedback_cards:
        card_content = [
            [Paragraph(f"<b>{card.category}</b>", ParagraphStyle('CardHead', fontName='Helvetica-Bold', fontSize=10, textColor=colors.white))],
            [Paragraph(f"<b>💡 Actionable Recommendation:</b><br/>{card.actionable_recommendation}", bold_rec_style)],
            [Paragraph(f"<b>🔍 Observed Diagnosis:</b><br/>{card.observed_diagnosis}", diag_style)]
        ]
        
        card_table = Table(card_content, colWidths=[530])
        card_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (0,0), PRIMARY),
            ('BACKGROUND', (0,1), (0,1), colors.HexColor("#eff6ff")), # Soft Blue
            ('BACKGROUND', (0,2), (0,2), LIGHT_BG),
            ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
            ('PADDING', (0,0), (-1,-1), 8),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        story.append(KeepTogether([card_table, Spacer(1, 10)]))
        
    # --- PAGE 3: EVIDENCE & BUZZWORD AUDIT ---
    story.append(PageBreak())
    story.append(Paragraph("<b>Evidence Graph & Buzzword Audit</b>", title_style))
    story.append(Paragraph("Detailed substantiation check of candidate claims made during the interview.", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER_COLOR, spaceBefore=6, spaceAfter=12))
    
    audit_rows = [["Candidate Claim / Statement", "Category", "Status", "Details & Missing Metrics"]]
    for entry in report.claim_audit:
        status_fmt = f"<font color='#16a34a'><b>Substantiated</b></font>" if entry.status == "Substantiated" else f"<font color='#d97706'><b>Unsubstantiated</b></font>"
        missing_text = "; ".join(entry.missing_details) if entry.missing_details else "None"
        
        audit_rows.append([
            Paragraph(entry.claim_text, body_style),
            entry.category,
            Paragraph(status_fmt, body_style),
            Paragraph(missing_text, body_style)
        ])
        
    audit_table = Table(audit_rows, colWidths=[180, 90, 90, 170])
    audit_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 9),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(audit_table)
    story.append(Spacer(1, 16))
    
    # --- PAGE 4: PERSONALIZED STUDY ROADMAP ---
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>Personalized Technical Study Roadmap</b>", section_heading))
    
    roadmap_html = "<br/>".join([f"<b>{i+1}.</b> {item}" for i, item in enumerate(report.study_roadmap)])
    roadmap_box = Table([[Paragraph(roadmap_html, body_style)]], colWidths=[530])
    roadmap_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor("#f0fdf4")), # Soft Green
        ('BOX', (0,0), (0,0), 1, colors.HexColor("#bbf7d0")),
        ('PADDING', (0,0), (0,0), 10),
    ]))
    story.append(roadmap_box)
    
    doc.build(story)
    return output_path
