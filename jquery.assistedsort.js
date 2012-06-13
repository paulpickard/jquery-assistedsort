;(function($){

	$.fn.assistedSort = function(method){

		if(methods[method]){
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		}
		else if(typeof method === "object" || !method){
			return methods.init.apply( this, arguments );
		}
		else{
			$.error("method " +  method + " does not exist on jQuery.assistedSort");
		}

	}

	var methods = {

		init: function(options){

			var opts = $.extend({}, $.fn.assistedSort.defaults, options);

			return this.each(function(){

				var table = $(this).children("tbody");
				var count = 0;

				table.find(opts.inputSelector).each(function(){

					var input = $(this);

					count ++;

					// manually set an index for each row
					input.data("assistedsort-index", count);

					// odd-even row colors
					zebraStripe(input, count, opts);

				}).keyup(function(event){

					var key = event.keyCode;
					var input = $(this);

					if(key == "38"){

						moveRowUp(input, table, opts);

						// highlight the current order
						input.select().focus();

						event.preventDefault();

					}
					else if(key == "40"){

						moveRowDown(input, count, table, opts);

						// highlight the current order
						input.select().focus();

						event.preventDefault();

					}

				}).focus(function(){

					// hightlight the row
					if(opts.highlight){
						$(this).parents(opts.rowSelector).addClass(opts.highlightClass);
					}

				}).blur(function(){

					var input = $(this);

					// move the row to the number entered
					var index = input.val();

					moveRowToIndex(input, index, table, opts);

				}).attr("autocomplete", "off");

				var data = {
					opts: opts,
					table: table,
					count: count
				};

				$(this).data("assistedsort", data);

			});

		},

		moveToIndex: function(index){

			return this.each(function(){

				var me = $(this);

				var data = me.closest("table").data("assistedsort");

				if(data === undefined){
					$.error("Please call moveToIndex on a row or a sort order input that is inside a table that has been inited.");

					return;
				}

				if(me.is(data.opts.inputSelector)){
					// they called it on the input
					var input = me;
				}
				else if(me.is(data.opts.rowSelector)){
					// they called it on the row
					var input = me.find(data.opts.inputSelector);
				}
				else{
					$.error("Please call moveToIndex on a row or a sort order input.");

					return;
				}

				moveRowToIndex(input, index, data.table, data.opts);

			});

		},

		moveDown: function(){

			return this.each(function(){

				var me = $(this);

				var data = me.closest("table").data("assistedsort");

				if(data === undefined){
					$.error("Please call moveDown on a row or a sort order input that is inside a table that has been inited.");

					return;
				}

				if(me.is(data.opts.inputSelector)){
					// they called it on the input
					var input = me;
				}
				else if(me.is(data.opts.rowSelector)){
					// they called it on the row
					var input = me.find(data.opts.inputSelector);
				}
				else{
					$.error("Please call moveDown on a row or a sort order input.");

					return;
				}

				moveRowDown(input, data.count, data.table, data.opts);

			});

		},

		moveUp: function(){

			return this.each(function(){

				var me = $(this);

				var data = me.closest("table").data("assistedsort");

				if(data === undefined){
					$.error("Please call moveUp on a row or a sort order input that is inside a table that has been inited.");

					return;
				}

				if(me.is(data.opts.inputSelector)){
					// they called it on the input
					var input = me;
				}
				else if(me.is(data.opts.rowSelector)){
					// they called it on the row
					var input = me.find(data.opts.inputSelector);
				}
				else{
					$.error("Please call moveUp on a row or a sort order input.");

					return;
				}

				moveRowUp(input, data.table, data.opts);

			});

		}

	};

	function moveRowDown(input, count, table, opts){

		var row = input.parents(opts.rowSelector);
		var index = input.data("assistedsort-index");

		if(index != count){

			// get the next row and input
			var next = row.next(opts.rowSelector);
			var next_input = next.find(opts.inputSelector);

			// move the other rows around the current one
			next.insertBefore(row);

			// odd-even row colors
			zebraStripe(row, index + 1, opts);
			zebraStripe(next, index, opts);

			// set the new sort order values
			input.val(index + 1);
			next_input.val(index);

			// set the indexes
			input.data("assistedsort-index", index + 1);
			next_input.data("assistedsort-index", index);

		}

	}

	function moveRowUp(input, table, opts){

		var row = input.parents(opts.rowSelector);
		var index = input.data("assistedsort-index");

		if(index != 1){
			
			// get the previous row and input
			var prev = row.prev(opts.rowSelector);
			var prev_input = prev.find(opts.inputSelector);

			// move the other row around the current one
			prev.insertAfter(row);

			// odd-even row colors
			zebraStripe(prev, index, opts);
			zebraStripe(row, index - 1, opts);

			// set the new sort order values
			input.val(index - 1);
			prev_input.val(index);

			// set the indexes
			input.data("assistedsort-index", index - 1);
			prev_input.data("assistedsort-index", index);

		}

	}

	function moveRowToIndex(input, index, table, opts){

		// is it a number?
		if($.isNumeric(index)){

			var row = input.parents(opts.rowSelector);
			var current_index = input.data("assistedsort-index");

			// does it need to be moved?
			if(index != current_index){

				// get the existing row at the entered number
				var existing_row = $(opts.rowSelector+":eq("+(Math.floor(index))+")");

				if(existing_row.length){

					// check if you are moving the row up or down the list
					if(index > current_index){

						// move the current row after the existing one
						existing_row.after(row);

					}
					else{

						// move the current row before the existing one
						existing_row.before(row);

					}

				}
				else{

					// move it to the end
					$(opts.rowSelector+":last").after(row);

				}

				resetSortOrder(table, opts);
			}
		}
		else{

			alert("Please enter a valid number.");

			input.select().focus();

		}

		// unhighlight the row
		if(opts.highlight){
			input.parents(opts.rowSelector).removeClass(opts.highlightClass);
		}

	}

	function resetSortOrder(table, opts){

		table.find(opts.inputSelector).each(function(i){

			var $this = $(this);

			// value and index
			$this.val(i + 1);
			$this.data("assistedsort-index", i + 1);

			// odd-even row colors
			zebraStripe($this, i + 1, opts);

		});

	}

	function zebraStripe(row, index, opts){

		if(opts.zebraStripe == true){

			// allow input to be passed in
			if(row.is(opts.inputSelector)){
				var this_row = row.parents(opts.rowSelector);
			}
			else{
				var this_row = row;
			}

			if(index % 2 == 1){
				this_row.removeClass("even").addClass("odd");
			}
			else{
				this_row.removeClass("odd").addClass("even");
			}

		}

	}

	$.fn.assistedSort.defaults = {
		rowSelector: "tr",
		inputSelector: "input",
		highlight: true,
		highlightClass: "highlighted",
		zebraStripe: true
	};

})(jQuery);