import { ProjectCommand } from '../../util/commands/ProjectCommand.js';
import { readProducts } from '../../util/payments/readProducts.js';

// TODO: remove once upload is all wired up
export default class BundleProducts extends ProjectCommand {
  static override description = 'Read the products configured in `products.json`';

  static override examples = ['$ devvit products bundle'];

  static override hidden = true;

  async run(): Promise<void> {
    const prds = await readProducts(this.projectRoot);
    this.log(
      'Found products: ',
      prds.map((p) => p.sku)
    );
  }
}
