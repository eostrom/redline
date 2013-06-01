# Public: Tags plugin allows users to tag thier annotations with metadata
# stored in an Array on the annotation as tags.
class Annotator.Plugin.Vote extends Annotator.Plugin

  options: {}

  # The field element added to the Annotator.Editor wrapped in jQuery. Cached to
  # save having to recreate it everytime the editor is displayed.
  yeaField: null
  nayField: null

  # TODO: UPDATE FOR VOTE
  # The input element added to the Annotator.Editor wrapped in jQuery. Cached to
  # save having to recreate it everytime the editor is displayed.
  input: null

  # Public: Initialises the plugin and adds custom fields to both the
  # annotator viewer and editor. The plugin also checks if the annotator is
  # supported by the current browser.
  #
  # Returns nothing.
  pluginInit: ->
    return unless Annotator.supported()

    @yeaField = @annotator.editor.addField({
      label:  Annotator._t('Yea')
      type: 'checkbox'
      load:   this.updateYea
      submit: this.setAnnotationYea
    })

    @nayField = @annotator.editor.addField({
      label:  Annotator._t('Nay')
      type: 'checkbox'
      load:   this.updateNay
      submit: this.setAnnotationNay
    })

    @annotator.viewer.addField({
      load: this.updateViewer
    })

    # TODO: MAKE THIS WORK
    #
    # Add a filter to the Filter plugin if loaded.
    if @annotator.plugins.Filter
      @annotator.plugins.Filter.addFilter
        label: Annotator._t('Vote')
        property: 'vote'
        isFiltered: Annotator.Plugin.Tags.filterCallback

    # TODO: UPDATE DOCUMENTATION
    #
  # Annotator.Editor callback function. Updates the @input field with the
  # tags attached to the provided annotation.
  #
  # field      - The tags field Element containing the input Element.
  # annotation - An annotation object to be edited.
  #
  # Examples
  #
  #   field = $('<li><input /></li>')[0]
  #   plugin.updateField(field, {tags: ['apples', 'oranges', 'cake']})
  #   field.value # => Returns 'apples oranges cake'
  #
  # Returns nothing.
  updateYea: (field, annotation) =>
    $(field).find('input').prop('checked', annotation.vote == 'Yea')

  updateNay: (field, annotation) =>
    $(field).find('input').prop('checked', annotation.vote == 'Nay')

    # TODO: UPDATE DOCUMENTATION
    #
  # Annotator.Editor callback function. Updates the annotation field with the
  # data retrieved from the @input property.
  #
  # field      - The tags field Element containing the input Element.
  # annotation - An annotation object to be updated.
  #
  # Examples
  #
  #   annotation = {}
  #   field = $('<li><input value="cake chocolate cabbage" /></li>')[0]
  #
  #   plugin.setAnnotationTags(field, annotation)
  #   annotation.tags # => Returns ['cake', 'chocolate', 'cabbage']
  #
  # Returns nothing.
  setAnnotationYea: (field, annotation) =>
    checkbox = $(field).find('input')
    checked = $(checkbox).prop('checked')
    annotation.vote = 'Yea' if checked

  setAnnotationNay: (field, annotation) =>
    checkbox = $(field).find('input')
    checked = $(checkbox).prop('checked')
    annotation.vote = 'Nay' if checked

  # Annotator.Viewer callback function. Updates the annotation display with vote
  # removes the field from the Viewer if there is no vote to display.
  #
  # field      - The Element to populate
  # annotation - An annotation object to be displayed
  #
  # Returns nothing.
  updateViewer: (field, annotation) ->
    field = $(field)

    if annotation.vote
      field.html(annotation.vote)
    else
      field.remove()

# TODO: CHANGE TAGS TO VOTE
#
# Checks an input string of keywords against an array of tags. If the keywords
# match _all_ tags the function returns true. This should be used as a callback
# in the Filter plugin.
#
# input - A String of keywords from a input field.
#
# Examples
#
#   Tags.filterCallback('cat dog mouse', ['cat', 'dog', 'mouse']) //=> true
#   Tags.filterCallback('cat dog', ['cat', 'dog', 'mouse']) //=> true
#   Tags.filterCallback('cat dog', ['cat']) //=> false
#
# Returns true if the input keywords match all tags.
Annotator.Plugin.Vote.filterCallback = (input, tags = []) ->
  matches  = 0
  keywords = []
  if input
    keywords = input.split(/\s+/g)
    for keyword in keywords when tags.length
      matches += 1 for tag in tags when tag.indexOf(keyword) != -1

  matches == keywords.length
