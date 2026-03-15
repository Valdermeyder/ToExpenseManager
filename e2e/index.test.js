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

    await t.expect(file).eql('30.10.2019,9839.29,Income,,Credit Card,,,Employer,,,Citi PLN\n28.10.2019,-10,,,Credit Card,,,Play,,,Citi PLN\n')
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

    await t.expect(file).eql('30.10.2019,9839.29,Income,,Credit Card,opłata za luty,,Employer,,,Santander\n28.10.2019,-10,,,Credit Card,opłata za internet za potoczny miesią,,Play,,,Santander\n27.10.2019,-5,,,Credit Card,VISA SEL 123456******1234 PŁATNOŚĆ KARTĄ 5.00 EUR Gate Retail Wizz EUR Luton,,Gate Retail Wizz,,,Santander EUR\n30.09.2023,-2.16,,,Credit Card,Opłata za prowadzenie rachunku od 01.09.2023 do 30.09.2023,,Santander,,,Santander\n')
})
    .after(() => unlinkSync(expectedFile))

test('should download converted csv without mapping for Velobank', async t => {
    expectedFile = join(`${homedir()}`, 'Downloads', 'testDataVelobank-converted.csv')
    await t
        .setFilesToUpload(Selector('#file'), 'testDataVelobank.csv')
        .click(Selector('#velobank'))
        .click(Selector('button'))

    await waitForFile(expectedFile)
    const file = readFileSync(expectedFile, 'utf-8')

    await t.expect(file).eql('30.10.2019,9839.29,Income,,Credit Card,,,Employer,,,GetIn\n28.10.2019,-10,,,Credit Card,,,Play,,,GetIn\n')
})
    .after(() => unlinkSync(expectedFile))

test('should download converted csv without mapping for Revolut', async t => {
    expectedFile = join(`${homedir()}`, 'Downloads', 'testDataRevolut-converted.csv')
    await t
        .setFilesToUpload(Selector('#file'), 'testDataRevolut.csv')
        .click(Selector('#revolut'))
        .click(Selector('button'))

    await waitForFile(expectedFile)
    const file = readFileSync(expectedFile, 'utf-8')

    await t.expect(file).eql('30.10.2019,9839.29,Income,,Credit Card,,,Employer,,,Revolut SEK\n28.10.2019,-10,,,Credit Card,,,Play,,,Revolut SEK\n')
})
    .after(() => unlinkSync(expectedFile))
