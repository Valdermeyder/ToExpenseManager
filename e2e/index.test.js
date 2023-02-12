import { homedir } from 'os';
import { join } from 'path';
import { statSync, unlinkSync, readFileSync } from 'fs';
import { Selector } from 'testcafe';

// eslint-disable-next-line no-undef
fixture('Getting Started').page('http://localhost:3000');

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForFile(filename) {
    try {
        statSync(filename);
        return true;
    }
    catch (e) {
        if (e.code !== 'ENOENT')
            return true;

        await delay(300);
        return waitForFile(filename);
    }
}

let expectedFile

test('should download converted csv without mapping for City by default', async t => {
    expectedFile = join(`${homedir()}`, 'Downloads', 'testDataCity-converted.csv')
    await t
        .setFilesToUpload(Selector('#file'), 'testDataCity.csv')
        .click(Selector('button'))

    await waitForFile(expectedFile)
    const file = readFileSync(expectedFile, 'utf-8')

    await t.expect(file).eql('30.10.2019,9839.29,Income,,Credit Card,,,Employer,,,CitiBank\n28.10.2019,-10,,,Credit Card,,,Play,,,CitiBank\n')
})
    .after(() => unlinkSync(expectedFile))

test('should download converted csv without mapping for Monobank', async t => {
    expectedFile = join(`${homedir()}`, 'Downloads', 'testDataMonobank-converted.csv')
    await t
        .setFilesToUpload(Selector('#file'), 'testDataMonobank.csv')
        .click(Selector('#monobank'))
        .click(Selector('button'))

    await waitForFile(expectedFile)
    const file = readFileSync(expectedFile, 'utf-8')

    await t.expect(file).eql('30.10.2019,9839.29,Income,,Credit Card,,,Employer,,,Monobank\n28.10.2019,-10,,,Credit Card,,,Play,,,Monobank\n')
})
    .after(() => unlinkSync(expectedFile))

test('should download converted csv without mapping for Pekao', async t => {
    expectedFile = join(`${homedir()}`, 'Downloads', 'testDataPekao-converted.csv')
    await t
        .setFilesToUpload(Selector('#file'), 'testDataPekao.csv')
        .click(Selector('#pekao'))
        .click(Selector('button'))

    await waitForFile(expectedFile)
    const file = readFileSync(expectedFile, 'utf-8')

    await t.expect(file).eql('30.10.2019,9839.29,Income,,Credit Card,,,Employer,,,Pekao\n28.10.2019,-10,,,Credit Card,,,Play,,,Pekao\n')
})
    .after(() => unlinkSync(expectedFile))

test('should download converted csv without mapping for Santander', async t => {
    expectedFile = join(`${homedir()}`, 'Downloads', 'testDataSantander-converted.csv')
    await t
        .setFilesToUpload(Selector('#file'), 'testDataSantander.csv')
        .click(Selector('#santander'))
        .click(Selector('button'))

    await waitForFile(expectedFile)
    const file = readFileSync(expectedFile, 'utf-8')

    await t.expect(file).eql('30.10.2019,9839.29,Income,,Credit Card,,,Employer,,,Santander\n28.10.2019,-10,,,Credit Card,,,Play,,,Santander\n')
})
    .after(() => unlinkSync(expectedFile))
