/**
 * coverageReport.test.js — Generates a machine-readable coverage report
 *
 * This test file collects precise coverage data and outputs it.
 * Run: npx vitest run tests/unit/coverageReport.test.js
 */
import { describe, it, expect } from 'vitest';
import { ALL_EXPERIMENTS, getExperimentsByVolume } from '../../src/data/experiments-index';
import { getAvailableLessonPaths } from '../../src/data/lesson-paths';
import { getScratchExperimentIds, getChapterMap } from '../../src/data/chapter-map';

describe('coverage report', () => {
  it('generates complete coverage data', () => {
    const paths = new Set(getAvailableLessonPaths());
    const scratchIds = new Set(getScratchExperimentIds());

    const report = {};
    for (const volNum of [1, 2, 3]) {
      const exps = getExperimentsByVolume(volNum);
      report[`vol${volNum}`] = {
        total: exps.length,
        withBuildSteps: exps.filter(e => e.buildSteps?.length > 0).length,
        withScratchXml: exps.filter(e => scratchIds.has(e.id)).length,
        withLessonPath: exps.filter(e => paths.has(e.id)).length,
        withCode: exps.filter(e => !!e.code).length,
        missingLessonPath: exps.filter(e => !paths.has(e.id)).map(e => e.id),
        missingScratchXml: volNum === 3 ? exps.filter(e => !scratchIds.has(e.id)).map(e => e.id) : [],
        missingBuildSteps: exps.filter(e => !e.buildSteps?.length).map(e => e.id),
      };
    }

    // Sanity check
    expect(report.vol1.total).toBe(38);
    expect(report.vol2.total).toBe(27);
    expect(report.vol3.total).toBe(27);

    // Output for documentation (will be captured in test output)
    console.log('\n=== ELAB COVERAGE REPORT (10/04/2026) ===\n');
    console.log('| Metrica | Vol1 | Vol2 | Vol3 | Total |');
    console.log('|---------|------|------|------|-------|');
    console.log(`| Esperimenti | ${report.vol1.total} | ${report.vol2.total} | ${report.vol3.total} | ${report.vol1.total + report.vol2.total + report.vol3.total} |`);
    console.log(`| buildSteps | ${report.vol1.withBuildSteps}/${report.vol1.total} | ${report.vol2.withBuildSteps}/${report.vol2.total} | ${report.vol3.withBuildSteps}/${report.vol3.total} | ${report.vol1.withBuildSteps + report.vol2.withBuildSteps + report.vol3.withBuildSteps}/${report.vol1.total + report.vol2.total + report.vol3.total} |`);
    console.log(`| scratchXml | ${report.vol1.withScratchXml}/${report.vol1.total} | ${report.vol2.withScratchXml}/${report.vol2.total} | ${report.vol3.withScratchXml}/${report.vol3.total} | ${report.vol1.withScratchXml + report.vol2.withScratchXml + report.vol3.withScratchXml}/${report.vol1.total + report.vol2.total + report.vol3.total} |`);
    console.log(`| lessonPath | ${report.vol1.withLessonPath}/${report.vol1.total} | ${report.vol2.withLessonPath}/${report.vol2.total} | ${report.vol3.withLessonPath}/${report.vol3.total} | ${report.vol1.withLessonPath + report.vol2.withLessonPath + report.vol3.withLessonPath}/${report.vol1.total + report.vol2.total + report.vol3.total} |`);
    console.log(`| code (C++) | 0/${report.vol1.total} | 0/${report.vol2.total} | ${report.vol3.withCode}/${report.vol3.total} | ${report.vol3.withCode}/${report.vol3.total} |`);

    console.log(`\nVol3 MISSING scratchXml (${report.vol3.missingScratchXml.length}/${report.vol3.total}):`);
    console.log('  ' + report.vol3.missingScratchXml.join(', '));

    console.log(`\nMISSING lessonPath:`);
    console.log(`  Vol1 (${report.vol1.missingLessonPath.length}): ${report.vol1.missingLessonPath.join(', ') || 'none'}`);
    console.log(`  Vol2 (${report.vol2.missingLessonPath.length}): ${report.vol2.missingLessonPath.join(', ') || 'none'}`);
    console.log(`  Vol3 (${report.vol3.missingLessonPath.length}): ${report.vol3.missingLessonPath.join(', ') || 'none'}`);

    // Chapter-map structure report
    const map = getChapterMap();
    console.log('\n=== CHAPTER MAP STRUCTURE ===\n');
    for (const vol of map) {
      console.log(`${vol.label} (${vol.sub}) — ${vol.totalExperiments} esperimenti, ${vol.chapters.length} capitoli`);
      for (const chap of vol.chapters) {
        const scratchMark = chap.hasScratch ? ' [SCRATCH]' : '';
        const pathMark = chap.hasLessonPath ? ' [LESSON-PATH]' : '';
        console.log(`  ${chap.name} (${chap.count} esp)${scratchMark}${pathMark}`);
      }
    }
  });
});
