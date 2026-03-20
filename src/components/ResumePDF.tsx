import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { TailoredResume } from '../types';

const styles = StyleSheet.create({
  page: {
    padding: 45,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.3,
    color: '#1a1a1a',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
    paddingBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 6,
    color: '#111827',
    letterSpacing: -0.2,
  },
  contact: {
    fontSize: 8.5,
    color: '#4b5563',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    alignItems: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    marginHorizontal: 4,
    color: '#9ca3af',
    fontSize: 10,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    borderBottomWidth: 0.5,
    borderBottomColor: '#d1d5db',
    paddingBottom: 2,
    marginBottom: 8,
    textTransform: 'uppercase',
    color: '#111827',
    letterSpacing: 1,
  },
  summary: {
    marginBottom: 10,
    textAlign: 'left',
    color: '#374151',
    lineHeight: 1.4,
  },
  experienceItem: {
    marginBottom: 12,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  company: {
    fontWeight: 700,
    fontSize: 11,
    color: '#111827',
  },
  position: {
    fontWeight: 700,
    fontSize: 10,
    color: '#4b5563',
  },
  duration: {
    color: '#6b7280',
    fontSize: 8.5,
    fontWeight: 400,
  },
  bulletPoint: {
    marginLeft: 10,
    marginBottom: 2,
    flexDirection: 'row',
  },
  bullet: {
    width: 10,
    color: '#4b5563',
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    textAlign: 'left',
    color: '#374151',
    lineHeight: 1.4,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  projectTech: {
    fontSize: 8.5,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  skillsGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  skillCategory: {
    flex: 1,
  },
  skillLabel: {
    fontWeight: 700,
    fontSize: 9,
    marginBottom: 3,
    color: '#111827',
    textTransform: 'uppercase',
  },
  skillText: {
    color: '#374151',
    lineHeight: 1.4,
  }
});

export const ResumePDF = ({ data }: { data: TailoredResume }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.name}>{data.personalInfo.fullName}</Text>
        <View style={styles.contact}>
          <Text>{data.personalInfo.location}</Text>
          <Text style={styles.dot}>•</Text>
          <Text>{data.personalInfo.phone}</Text>
          <Text style={styles.dot}>•</Text>
          <Text>{data.personalInfo.email}</Text>
          {data.personalInfo.linkedin && (
            <>
              <Text style={styles.dot}>•</Text>
              <Text>{data.personalInfo.linkedin}</Text>
            </>
          )}
          {data.personalInfo.website && (
            <>
              <Text style={styles.dot}>•</Text>
              <Text>{data.personalInfo.website}</Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Summary</Text>
        <Text style={styles.summary}>{data.summary}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience</Text>
        {data.experience.map((exp, i) => (
          <View key={i} style={styles.experienceItem}>
            <View style={styles.experienceHeader}>
              <Text style={styles.company}>{exp.company}</Text>
              <Text style={styles.duration}>{exp.duration}</Text>
            </View>
            <View style={styles.experienceHeader}>
              <Text style={styles.position}>{exp.position}</Text>
              <Text style={styles.duration}>{exp.location}</Text>
            </View>
            {exp.bulletPoints.map((point, j) => (
              <View key={j} style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{point}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Education</Text>
        {data.education.map((edu, i) => (
          <View key={i} style={styles.experienceItem}>
            <View style={styles.experienceHeader}>
              <Text style={styles.company}>{edu.school}</Text>
              <Text style={styles.duration}>{edu.duration}</Text>
            </View>
            <View style={styles.experienceHeader}>
              <Text style={styles.position}>{edu.degree}</Text>
              <Text style={styles.duration}>{edu.location}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.skillsGrid}>
          <View style={styles.skillCategory}>
            <Text style={styles.skillLabel}>Technical Skills</Text>
            <Text style={styles.skillText}>{data.skills.technical.join(', ')}</Text>
          </View>
          <View style={styles.skillCategory}>
            <Text style={styles.skillLabel}>Soft Skills</Text>
            <Text style={styles.skillText}>{data.skills.soft.join(', ')}</Text>
          </View>
        </View>
      </View>

      {data.projects && data.projects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects</Text>
          {data.projects.map((proj, i) => (
            <View key={i} style={styles.experienceItem}>
              <View style={styles.projectHeader}>
                <Text style={styles.company}>{proj.name}</Text>
                <Text style={styles.projectTech}>{proj.technologies.join(' | ')}</Text>
              </View>
              <Text style={styles.bulletText}>{proj.description}</Text>
            </View>
          ))}
        </View>
      )}
    </Page>
  </Document>
);
