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

const expectedFile = join(`${homedir()}`, 'Downloads', 'testData-converted.csv')

test('should download converted csv without mapping', async t => {
    await t
        .setFilesToUpload(Selector('#file'), 'testData.csv')
        .click(Selector('button'))

    await waitForFile(expectedFile)
    const file = readFileSync(expectedFile, 'utf-8')

    await t.expect(file).eql('30.10.2019,9839.29,Income,,Credit Card,,,Employer,,,CitiBank\n28.10.2019,-10,,,Credit Card,,,Play,,,CitiBank\n')
})
    .after(() => unlinkSync(expectedFile))
