/**
 * videoCourses — Tests for video course data integrity
 * Claude code andrea marro — 11/04/2026
 */
import { describe, it, expect } from 'vitest';
import { VIDEO_COURSES } from '../../src/data/video-courses';

describe('videoCourses', () => {
  it('VIDEO_COURSES is a non-empty array', () => {
    expect(Array.isArray(VIDEO_COURSES)).toBe(true);
    expect(VIDEO_COURSES.length).toBeGreaterThan(0);
  });

  it('has courses for all 3 volumes', () => {
    const volumes = [...new Set(VIDEO_COURSES.map(c => c.volumeId))];
    expect(volumes).toContain('v1');
    expect(volumes).toContain('v2');
    expect(volumes).toContain('v3');
  });

  it('every course has required fields', () => {
    for (const course of VIDEO_COURSES) {
      expect(course.id).toBeTruthy();
      expect(course.title).toBeTruthy();
      expect(course.description).toBeTruthy();
      expect(course.volumeId).toBeTruthy();
      expect(course.volumeLabel).toBeTruthy();
      expect(course.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(typeof course.order).toBe('number');
    }
  });

  it('all IDs are unique', () => {
    const ids = VIDEO_COURSES.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('orders are sequential', () => {
    const orders = VIDEO_COURSES.map(c => c.order);
    for (let i = 1; i < orders.length; i++) {
      expect(orders[i]).toBeGreaterThan(orders[i - 1]);
    }
  });

  it('volume colors match ELAB palette', () => {
    const v1Courses = VIDEO_COURSES.filter(c => c.volumeId === 'v1');
    const v2Courses = VIDEO_COURSES.filter(c => c.volumeId === 'v2');
    const v3Courses = VIDEO_COURSES.filter(c => c.volumeId === 'v3');
    for (const c of v1Courses) expect(c.color).toBe('#4A7A25');
    for (const c of v2Courses) expect(c.color).toBe('#E8941C');
    for (const c of v3Courses) expect(c.color).toBe('#E54B3D');
  });
});
