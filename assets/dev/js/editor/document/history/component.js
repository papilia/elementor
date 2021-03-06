import ComponentBase from 'elementor-api/modules/component-base';
import * as commandsInternal from './commands/internal';

export default class Component extends ComponentBase {
	__construct( args ) {
		super.__construct( args );

		/**
		 * Transactions holder.
		 *
		 * @type {Array}
		 */
		this.transactions = [];
	}

	getNamespace() {
		return 'document/history';
	}

	getCommands() {
		return {
			do: ( args ) => elementor.documents.getCurrent().history.doItem( args.index ),
			undo: () => elementor.documents.getCurrent().history.navigate(),
			'undo-all': ( args ) => {
				const itemsLength = args.document.history.getItems().length;
				if ( ! itemsLength ) {
					return;
				}

				args.document.history.doItem( itemsLength - 1 );
			},
			redo: () => elementor.documents.getCurrent().history.navigate( true ),
		};
	}

	getCommandsInternal() {
		return this.importCommands( commandsInternal );
	}

	normalizeLogTitle( args ) {
		const { containers = [ args.container ] } = args;

		if ( ! args.title && containers[ 0 ] ) {
			if ( 1 === containers.length ) {
				args.title = containers[ 0 ].label;
			} else {
				args.title = elementor.translate( 'elements' );
			}
		}

		return args;
	}

	mergeTransactions( transactions ) {
		const result = {};

		transactions.forEach( ( itemArgs ) => {
			// If no containers at the current transaction.
			if ( ! itemArgs.container && ! itemArgs.containers ) {
				return;
			}

			const { containers = [ itemArgs.container ] } = itemArgs;

			if ( containers ) {
				containers.forEach( ( container ) => {
					if ( ! itemArgs.data ) {
						return;
					}

					// Replace new changes by current itemArgs.
					if ( result[ container.id ] ) {
						result[ container.id ].data.changes[ container.id ].new =
							itemArgs.data.changes[ container.id ].new;

						return;
					}

					result[ container.id ] = itemArgs;
				} );
			}
		} );

		return result;
	}

	isTransactionStarted() {
		return Boolean( this.transactions.length );
	}
}
