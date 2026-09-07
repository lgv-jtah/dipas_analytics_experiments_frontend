<template>
  <AppShell>
    <!-- Loading / error -->
    <div v-if="loading" class="state-message">
      <HhText variant="body" color="secondary">Loading contribution…</HhText>
    </div>
    <div v-else-if="error" class="state-message state-message--error">
      <HhText variant="body" color="accent">Could not load data. Is the backend running?</HhText>
    </div>

    <template v-else>
      <!-- Page header -->
      <PageHeader
        :title="`Contribution #${contributionId}`"
        icon="evaluation"
      >
        <template #actions>
          <HhButton variant="ghost" size="sm" @click="$router.push('/evaluation/contributions')">
            ← Back to list
          </HhButton>
        </template>
      </PageHeader>

      <!-- Contribution text -->
      <HhCard variant="subtle" class="contribution-card">
        <HhText tag="p" variant="body" class="contribution-text">
          {{ contribution.contribution_content }}
        </HhText>
      </HhCard>

      <!-- Contribution Progress Bar -->
      <div v-if="totalItemsCount > 0" class="contribution-progress">
        <div class="contribution-progress__header">
          <HhText variant="caption" color="secondary">
            Your Progress
          </HhText>
          <HhText variant="caption" class="contribution-progress__stats">
            {{ evaluatedItemsCount }} / {{ totalItemsCount }} items evaluated
            <span class="contribution-progress__percentage">({{ contributionCompletionPercentage }}%)</span>
          </HhText>
        </div>
        <div class="contribution-progress__bar">
          <div 
            class="contribution-progress__fill"
            :style="{ width: `${contributionCompletionPercentage}%` }"
          ></div>
        </div>
      </div>

      <!-- Jump to Next Unevaluated Button -->
      <div v-if="totalItemsCount > 0 && evaluatedItemsCount < totalItemsCount" class="contribution-actions">
        <HhButton 
          variant="secondary" 
          size="sm" 
          @click="scrollToFirstUnevaluated"
        >
          <HhIcon name="arrow-down" size="sm" />
          Jump to Next Unevaluated
        </HhButton>
      </div>

      <!-- Key messages -->
      <div class="section-header">
        <HhText tag="h2" variant="subheading">Key Messages</HhText>
        <HhBadge variant="default">{{ keyMessages.length }}</HhBadge>
      </div>
      <HhText tag="p" variant="caption" color="secondary" class="section-hint">
        Evaluate whether each AI-extracted key message is a correct and meaningful summary of the contribution.
      </HhText>

      <div class="key-messages-list">
        <div
          v-for="(km, kmIndex) in keyMessages"
          :key="km.key_message"
          class="km-block"
          :class="{
            'km-block--expanded': expandedKm === kmIndex,
            'km-block--evaluated': kmEvaluations[km.key_message]?.verdict,
            'km-block--unevaluated': !kmEvaluations[km.key_message]?.verdict
          }"
          :data-km-id="km.key_message"
        >
          <!-- Key message header -->
          <div class="km-block__header" @click="toggleKm(kmIndex)">
            <div class="km-block__left">
              <HhBadge :variant="kmTypeBadgeVariant(km.key_message_type)" size="sm">
                {{ km.key_message_type }}
              </HhBadge>
              <HhText tag="span" variant="body" class="km-block__text">
                {{ km.key_message }}
              </HhText>
            </div>
            <div class="km-block__right">
              <!-- Verdict indicator -->
              <span
                v-if="kmEvaluations[km.key_message]?.verdict"
                class="verdict-pill"
                :class="`verdict-pill--${kmEvaluations[km.key_message].verdict}`"
              >
                {{ kmEvaluations[km.key_message].verdict }}
              </span>
              <HhIcon
                :name="expandedKm === kmIndex ? 'chevron-left' : 'chevron-right'"
                size="sm"
                class="km-block__chevron"
              />
            </div>
          </div>

          <!-- Expanded key message content -->
          <Transition name="expand">
            <div v-if="expandedKm === kmIndex" class="km-block__body">
              <!-- AI explanation -->
              <div class="km-explanation">
                <HhText tag="p" variant="caption" color="secondary" class="km-explanation__label">
                  AI explanation
                </HhText>
                <HhText tag="p" variant="body" class="km-explanation__text">
                  {{ km.key_message_explanation }}
                </HhText>
              </div>

              <!-- Key message evaluation form -->
              <div class="eval-form">
                <HhText tag="p" variant="label" class="eval-form__label">
                  Is this key message correct?
                </HhText>
                <div class="eval-form__controls">
                  <HhVerdictPicker
                    v-model="kmEvaluations[km.key_message].verdict"
                    :disabled="submittingKm[km.key_message]"
                  />
                  <HhTextarea
                    v-model="kmEvaluations[km.key_message].comment"
                    placeholder="Optional note…"
                    :rows="2"
                    :disabled="submittingKm[km.key_message]"
                    class="eval-form__textarea"
                  />
                </div>

                <!-- Suggestion fields – only shown when verdict is incorrect -->
                <Transition name="suggestion">
                  <div
                    v-if="kmEvaluations[km.key_message].verdict === 'incorrect'"
                    class="suggestion-block"
                  >
                    <div class="suggestion-block__header">
                      <HhIcon name="key" size="sm" class="suggestion-block__icon" />
                      <HhText tag="p" variant="label">Suggest a better key message</HhText>
                    </div>
                    <HhText tag="p" variant="caption" color="secondary" class="suggestion-block__hint">
                      Optionally provide the key message you would have extracted and the sentence from the contribution it is based on.
                    </HhText>
                    <div class="suggestion-block__fields">
                      <div class="suggestion-block__field">
                        <label class="suggestion-block__field-label">Your key message</label>
                        <HhTextarea
                          v-model="kmEvaluations[km.key_message].suggested_key_message"
                          placeholder="e.g. Radwege sind zu schmal für den Schulweg"
                          :rows="2"
                          :disabled="submittingKm[km.key_message]"
                        />
                      </div>
                      <div class="suggestion-block__field">
                        <label class="suggestion-block__field-label">Related sentence from the contribution</label>
                        <HhTextarea
                          v-model="kmEvaluations[km.key_message].suggested_sentence"
                          placeholder="Copy the relevant sentence from the contribution text above…"
                          :rows="2"
                          :disabled="submittingKm[km.key_message]"
                        />
                      </div>
                    </div>
                  </div>
                </Transition>

                <div class="eval-form__footer">
                  <HhButton
                    variant="primary"
                    size="sm"
                    :loading="submittingKm[km.key_message]"
                    :disabled="!kmEvaluations[km.key_message].verdict"
                    @click="submitKmEvaluation(km)"
                  >
                    Save
                  </HhButton>
                  <HhText
                    v-if="kmSaveStatus[km.key_message]"
                    tag="span"
                    variant="caption"
                    :color="kmSaveStatus[km.key_message] === 'saved' ? 'secondary' : 'accent'"
                  >
                    {{ kmSaveStatus[km.key_message] === 'saved' ? 'Saved.' : 'Error saving. Try again.' }}
                  </HhText>
                </div>
              </div>

              <!-- Stances -->
              <div class="stances-section">
                <div class="stances-header">
                  <HhText tag="h3" variant="label">Comment Stances</HhText>
                  <HhBadge variant="default" size="sm">{{ km.stances?.length ?? 0 }}</HhBadge>
                </div>
                <HhText tag="p" variant="caption" color="secondary" class="section-hint">
                  Evaluate whether the AI correctly predicted each comment's stance toward this key message.
                </HhText>

                <div v-if="km.stancesLoading" class="state-message">
                  <HhText variant="caption" color="secondary">Loading stances…</HhText>
                </div>
                <div v-else-if="km.stancesError" class="state-message state-message--error">
                  <HhText variant="caption" color="accent">Could not load stances.</HhText>
                </div>
                <div v-else class="stances-list">
                  <div
                    v-for="stance in km.stances"
                    :key="`${stance.comment_text}_${stance.index ?? 'null'}`"
                    class="stance-card"
                    :class="{
                      'stance-card--evaluated': stanceEvaluations[stanceKey(km, stance, stance.index)]?.verdict,
                      'stance-card--unevaluated': !stanceEvaluations[stanceKey(km, stance, stance.index)]?.verdict
                    }"
                    :data-stance-id="stanceKey(km, stance, stance.index)"
                  >
                    <!-- Status badge in corner -->
                    <div class="stance-card__status">
                      <HhBadge 
                        v-if="stanceEvaluations[stanceKey(km, stance, stance.index)]?.verdict"
                        :variant="stanceEvaluations[stanceKey(km, stance, stance.index)].verdict === 'correct' ? 'success' : 'warning'"
                        size="sm"
                      >
                        {{ stanceEvaluations[stanceKey(km, stance, stance.index)].verdict === 'correct' ? '✓ Correct' : '✗ Incorrect' }}
                        <span v-if="stanceEvaluations[stanceKey(km, stance, stance.index)].correctedLabel">
                          → {{ stanceLabel(stanceEvaluations[stanceKey(km, stance, stance.index)].correctedLabel) }}
                        </span>
                      </HhBadge>
                    </div>
                    
                    <!-- Comment text -->
                    <HhText tag="p" variant="body" class="stance-card__comment">
                      "{{ stance.comment_text }}"
                    </HhText>

                    <!-- AI prediction -->
                    <div class="stance-card__prediction">
                      <HhText tag="span" variant="caption" color="secondary">AI stance: </HhText>
                      <HhBadge :variant="stanceBadgeVariant(stance.stance)" size="sm">
                        {{ stanceLabel(stance.stance) }}
                      </HhBadge>
                    </div>
                    
                    <!-- Corrected label display (if evaluated as incorrect) -->
                    <div 
                      v-if="stanceEvaluations[stanceKey(km, stance, stance.index)]?.verdict === 'incorrect' && stanceEvaluations[stanceKey(km, stance, stance.index)]?.correctedLabel"
                      class="stance-card__correction"
                    >
                      <HhText tag="span" variant="caption" color="secondary">
                        Corrected to:
                      </HhText>
                      <HhBadge :variant="stanceBadgeVariant(stanceEvaluations[stanceKey(km, stance, stance.index)].correctedLabel)" size="sm">
                        {{ stanceLabel(stanceEvaluations[stanceKey(km, stance, stance.index)].correctedLabel) }}
                      </HhBadge>
                    </div>

                    <!-- AI explanation -->
                    <details class="stance-card__details">
                      <summary class="stance-card__summary">
                        <HhText tag="span" variant="caption" color="secondary">View AI reasoning</HhText>
                      </summary>
                      <HhText tag="p" variant="caption" color="secondary" class="stance-card__explanation">
                        {{ stance.explanation }}
                      </HhText>
                    </details>

                    <!-- Stance evaluation form -->
                    <div class="eval-form eval-form--stance">
                      <!-- Step 1: Verdict -->
                      <HhVerdictPicker
                        v-model="stanceEvaluations[stanceKey(km, stance, stance.index)].verdict"
                        :disabled="submittingStance[stanceKey(km, stance, stance.index)]"
                      />
                      
                      <!-- Step 2: If incorrect, show label picker -->
                      <div 
                        v-if="stanceEvaluations[stanceKey(km, stance, stance.index)].verdict === 'incorrect'" 
                        class="label-picker"
                      >
                        <HhText variant="caption" color="secondary">
                          Select correct label:
                        </HhText>
                        <div class="label-picker__buttons">
                          <HhButton
                            variant="secondary"
                            size="sm"
                            :class="{ 'label-picker__button--active': stanceEvaluations[stanceKey(km, stance, stance.index)].correctedLabel === 'in favor' }"
                            @click="stanceEvaluations[stanceKey(km, stance, stance.index)].correctedLabel = 'in favor'"
                          >
                            In Favor
                          </HhButton>
                          <HhButton
                            variant="secondary"
                            size="sm"
                            :class="{ 'label-picker__button--active': stanceEvaluations[stanceKey(km, stance, stance.index)].correctedLabel === 'neutral' }"
                            @click="stanceEvaluations[stanceKey(km, stance, stance.index)].correctedLabel = 'neutral'"
                          >
                            Neutral
                          </HhButton>
                          <HhButton
                            variant="secondary"
                            size="sm"
                            :class="{ 'label-picker__button--active': stanceEvaluations[stanceKey(km, stance, stance.index)].correctedLabel === 'ablehnung' }"
                            @click="stanceEvaluations[stanceKey(km, stance, stance.index)].correctedLabel = 'ablehnung'"
                          >
                            Against
                          </HhButton>
                        </div>
                      </div>
                      
                      <!-- Optional comment -->
                      <HhTextarea
                        v-model="stanceEvaluations[stanceKey(km, stance, stance.index)].comment"
                        placeholder="Optional note…"
                        :rows="2"
                        :disabled="submittingStance[stanceKey(km, stance, stance.index)]"
                        class="eval-form__textarea"
                      />
                      
                      <HhButton
                        variant="primary"
                        size="sm"
                        :loading="submittingStance[stanceKey(km, stance, stance.index)]"
                        :disabled="!stanceEvaluations[stanceKey(km, stance, stance.index)].verdict"
                        @click="submitStanceEvaluation(km, stance)"
                      >
                        Save
                      </HhButton>
                      <HhText
                        v-if="stanceSaveStatus[stanceKey(km, stance, stance.index)]"
                        tag="span"
                        variant="caption"
                        :color="stanceSaveStatus[stanceKey(km, stance, stance.index)] === 'saved' ? 'secondary' : 'accent'"
                      >
                        {{ stanceSaveStatus[stanceKey(km, stance, stance.index)] === 'saved' ? 'Saved.' : 'Error saving.' }}
                      </HhText>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Evaluator-added key messages -->
      <div class="section-header added-km-section-header">
        <HhText tag="h2" variant="subheading">Added Key Messages</HhText>
        <HhBadge variant="default">{{ addedKeyMessages.length }}</HhBadge>
      </div>
      <HhText tag="p" variant="caption" color="secondary" class="section-hint">
        Key messages you identified that the model missed.
      </HhText>

      <!-- Display added key messages in expandable format like AI key messages -->
      <div v-if="addedKeyMessages.length" class="key-messages-list">
        <div
          v-for="(akm, akmIndex) in addedKeyMessages"
          :key="`added-${akm.id}`"
          class="km-block"
          :class="{
            'km-block--expanded': expandedAddedKm === akmIndex,
            'km-block--evaluated': akm.stances?.length > 0,
            'km-block--unevaluated': !akm.stances?.length
          }"
          :data-added-km-id="akm.id"
        >
          <!-- Key message header (clickable to expand) -->
          <div class="km-block__header" @click="toggleAddedKm(akmIndex)">
            <div class="km-block__left">
              <HhBadge :variant="kmTypeBadgeVariant(akm.key_message_type)" size="sm">
                {{ akm.key_message_type }}
              </HhBadge>
              <HhText tag="span" variant="body" class="km-block__text">
                {{ akm.key_message }}
              </HhText>
            </div>
            <div class="km-block__right">
              <HhBadge variant="accent" size="sm">Hand-labeled</HhBadge>
              <HhIcon
                :name="expandedAddedKm === akmIndex ? 'chevron-left' : 'chevron-right'"
                size="sm"
                class="km-block__chevron"
              />
            </div>
          </div>

          <!-- Expanded content -->
          <Transition name="expand">
            <div v-if="expandedAddedKm === akmIndex" class="km-block__body">
              <!-- Source sentence if provided -->
              <div v-if="akm.key_message_sentence" class="km-explanation">
                <HhText tag="p" variant="caption" color="secondary" class="km-explanation__label">
                  Source sentence
                </HhText>
                <HhText tag="p" variant="body" class="km-explanation__text">
                  "{{ akm.key_message_sentence }}"
                </HhText>
              </div>

              <!-- Stances section -->
              <div class="stances-section">
                <div class="stances-section__header">
                  <HhText tag="p" variant="label">Hand-labeled Stances</HhText>
                  <HhBadge variant="default" size="sm">{{ akm.stances?.length || 0 }}</HhBadge>
                </div>
                
                <div v-if="akm.stances && akm.stances.length > 0" class="stances-list">
                  <div
                    v-for="stance in akm.stances"
                    :key="stance.id"
                    class="stance-card"
                  >
                    <!-- Comment text -->
                    <HhText tag="p" variant="body" class="stance-card__comment">
                      "{{ stance.comment_text }}"
                    </HhText>
                    
                    <!-- Stance label -->
                    <div class="stance-card__meta">
                      <HhBadge :variant="stanceBadgeVariant(stance.stance_label)" size="sm">
                        {{ stanceLabel(stance.stance_label) }}
                      </HhBadge>
                    </div>
                  </div>
                </div>
                
                <!-- Show message if no stances or backend not updated -->
                <div v-else class="stances-empty">
                  <HhText variant="caption" color="secondary">
                    No stances labeled yet for this key message.
                  </HhText>
                </div>

                <!-- Edit / label stances action -->
                <div class="add-km-stances-toggle">
                  <HhButton
                    variant="ghost"
                    size="sm"
                    @click="toggleEditAddedKmStances(akm)"
                  >
                    {{ editingAddedKmId === akm.id ? '− Cancel' : (akm.stances?.length ? '✎ Edit stances' : '+ Label stances') }}
                  </HhButton>
                  <HhText
                    v-if="loadingComments && editingAddedKmId === akm.id"
                    variant="caption"
                    color="secondary"
                  >
                    Loading...
                  </HhText>
                </div>

                <!-- Stance editing form -->
                <Transition name="suggestion">
                  <div v-if="editingAddedKmId === akm.id" class="add-km-stances-list">
                    <div
                      v-if="availableComments.length === 0 && !loadingComments"
                      class="add-km-stances-empty"
                    >
                      <HhText variant="caption" color="secondary">
                        No comments available. Expand key messages above to load stances first.
                      </HhText>
                    </div>

                    <div
                      v-for="comment in (addedKmStanceDrafts[akm.id] || [])"
                      :key="`${comment.comment_text}_${comment.comment_index ?? 'null'}`"
                      class="add-km-stance-item"
                    >
                      <div class="add-km-stance-content">
                        <HhText tag="p" variant="body" class="add-km-stance-text">
                          "{{ comment.comment_text }}"
                        </HhText>

                        <div class="add-km-stance-label-picker">
                          <HhText variant="caption" color="secondary" class="label-picker-label">
                            Stance:
                          </HhText>
                          <div class="label-picker__buttons">
                            <HhButton
                              variant="secondary"
                              size="sm"
                              :class="{ 'label-picker__button--active': comment.stance_label === 'in favor' }"
                              @click="comment.stance_label = 'in favor'"
                              :disabled="submittingAddedKmEdit[akm.id]"
                            >
                              👍 In Favor
                            </HhButton>
                            <HhButton
                              variant="secondary"
                              size="sm"
                              :class="{ 'label-picker__button--active': comment.stance_label === 'neutral' }"
                              @click="comment.stance_label = 'neutral'"
                              :disabled="submittingAddedKmEdit[akm.id]"
                            >
                              ⚪ Neutral
                            </HhButton>
                            <HhButton
                              variant="secondary"
                              size="sm"
                              :class="{ 'label-picker__button--active': comment.stance_label === 'ablehnung' }"
                              @click="comment.stance_label = 'ablehnung'"
                              :disabled="submittingAddedKmEdit[akm.id]"
                            >
                              👎 Against
                            </HhButton>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="eval-form__footer">
                      <HhButton
                        variant="primary"
                        size="sm"
                        :loading="submittingAddedKmEdit[akm.id]"
                        :disabled="!(addedKmStanceDrafts[akm.id] && addedKmStanceDrafts[akm.id].length)"
                        @click="saveAddedKmStances(akm)"
                      >
                        Save
                      </HhButton>
                      <HhText
                        v-if="addedKmEditSaveStatus[akm.id]"
                        tag="span"
                        variant="caption"
                        :color="addedKmEditSaveStatus[akm.id] === 'saved' ? 'secondary' : 'accent'"
                      >
                        {{ addedKmEditSaveStatus[akm.id] === 'saved' ? 'Saved.' : 'Error saving. Try again.' }}
                      </HhText>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Add key message form toggle -->
      <div class="add-km-toggle">
        <HhButton
          variant="ghost"
          size="sm"
          @click="showAddKmForm = !showAddKmForm"
        >
          {{ showAddKmForm ? '− Cancel' : '+ Add key message' }}
        </HhButton>
      </div>

      <!-- Add key message form -->
      <Transition name="suggestion">
        <div v-if="showAddKmForm" class="add-km-form">
          <div class="add-km-form__header">
            <HhIcon name="key" size="sm" class="add-km-form__icon" />
            <HhText tag="p" variant="label">New key message</HhText>
          </div>
          <HhText tag="p" variant="caption" color="secondary" class="add-km-form__hint">
            Add a key message that the model has missed. Select its type, write the key message, and optionally copy the source sentence from the contribution above.
          </HhText>

          <div class="add-km-form__fields">
            <!-- Type selector -->
            <div class="add-km-form__field">
              <label class="add-km-form__field-label">Type</label>
              <div class="add-km-type-picker">
                <button
                  v-for="t in KM_TYPES"
                  :key="t"
                  type="button"
                  class="add-km-type-btn"
                  :class="{ 'add-km-type-btn--active': newKm.key_message_type === t }"
                  :disabled="submittingNewKm"
                  @click="newKm.key_message_type = t"
                >
                  {{ t }}
                </button>
              </div>
            </div>

            <!-- Key message text -->
            <div class="add-km-form__field">
              <label class="add-km-form__field-label">Key message</label>
              <HhTextarea
                v-model="newKm.key_message"
                placeholder="e.g. Radwege sind zu schmal für den Schulweg"
                :rows="2"
                :disabled="submittingNewKm"
              />
            </div>

            <!-- Source sentence -->
            <div class="add-km-form__field">
              <label class="add-km-form__field-label">Source sentence (optional)</label>
              <HhTextarea
                v-model="newKm.key_message_sentence"
                placeholder="Copy the relevant sentence from the contribution text above…"
                :rows="2"
                :disabled="submittingNewKm"
              />
            </div>

            <!-- NEW: Assign Stances Section -->
            <div class="add-km-form__field">
              <label class="add-km-form__field-label">
                Label Stances
                <HhBadge variant="accent" size="sm">{{ availableComments.length }} comments</HhBadge>
              </label>
              <HhText variant="caption" color="secondary" class="add-km-form__hint">
                Assign stance labels to all comments from this contribution.
              </HhText>
              
              <!-- Toggle button -->
              <div class="add-km-stances-toggle">
                <HhButton 
                  variant="ghost" 
                  size="sm" 
                  @click="showStancesSelector = !showStancesSelector"
                  :disabled="submittingNewKm"
                >
                  {{ showStancesSelector ? '− Hide comments' : '+ Show comments to label' }}
                </HhButton>
                
                <HhText 
                  v-if="loadingComments" 
                  variant="caption" 
                  color="secondary"
                >
                  Loading...
                </HhText>
              </div>
              
              <!-- Stances selector list -->
              <Transition name="suggestion">
                <div v-if="showStancesSelector" class="add-km-stances-list">
                  <div 
                    v-if="availableComments.length === 0 && !loadingComments"
                    class="add-km-stances-empty"
                  >
                    <HhText variant="caption" color="secondary">
                      No comments available. Expand key messages above to load stances first.
                    </HhText>
                  </div>
                  
                  <div 
                    v-for="(comment, idx) in availableComments" 
                    :key="`${comment.comment_text}_${comment.comment_index ?? 'null'}`"
                    class="add-km-stance-item"
                  >
                    <!-- Content -->
                    <div class="add-km-stance-content">
                      <!-- Comment text -->
                      <HhText tag="p" variant="body" class="add-km-stance-text">
                        "{{ comment.comment_text }}"
                      </HhText>
                      
                      <!-- Stance label picker (always shown) -->
                      <div class="add-km-stance-label-picker">
                        <HhText variant="caption" color="secondary" class="label-picker-label">
                          Stance:
                        </HhText>
                        <div class="label-picker__buttons">
                          <HhButton
                            variant="secondary"
                            size="sm"
                            :class="{ 'label-picker__button--active': comment.stance_label === 'in favor' }"
                            @click="comment.stance_label = 'in favor'"
                            :disabled="submittingNewKm"
                          >
                            👍 In Favor
                          </HhButton>
                          <HhButton
                            variant="secondary"
                            size="sm"
                            :class="{ 'label-picker__button--active': comment.stance_label === 'neutral' }"
                            @click="comment.stance_label = 'neutral'"
                            :disabled="submittingNewKm"
                          >
                            ⚪ Neutral
                          </HhButton>
                          <HhButton
                            variant="secondary"
                            size="sm"
                            :class="{ 'label-picker__button--active': comment.stance_label === 'ablehnung' }"
                            @click="comment.stance_label = 'ablehnung'"
                            :disabled="submittingNewKm"
                          >
                            👎 Against
                          </HhButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <div class="eval-form__footer">
            <HhButton
              variant="primary"
              size="sm"
              :loading="submittingNewKm"
              :disabled="!newKm.key_message.trim() || !newKm.key_message_type || availableComments.length === 0"
              @click="submitNewKmEvaluation"
            >
              Save
            </HhButton>
            <HhText 
              v-if="newKm.key_message.trim() && newKm.key_message_type && availableComments.length === 0"
              variant="caption" 
              color="accent"
              class="add-km-validation-hint"
            >
              ⚠️ Please label all comments first (expand key messages above to load)
            </HhText>
            <HhText
              v-if="newKmSaveStatus"
              tag="span"
              variant="caption"
              :color="newKmSaveStatus === 'saved' ? 'secondary' : 'accent'"
            >
              {{ newKmSaveStatus === 'saved' ? 'Saved.' : 'Error saving. Try again.' }}
            </HhText>
          </div>
        </div>
      </Transition>
    </template>
    
    <!-- Floating Action Button for Next Contribution -->
    <Teleport to="body">
      <Transition name="fab">
        <button 
          v-if="evaluator && allContributionsStats.length > 0"
          class="fab"
          @click="goToNextContribution"
          :disabled="nextContributionId === null"
          :title="nextContributionId ? `${remainingContributionsCount} contributions remaining` : 'All contributions evaluated!'"
        >
          <HhIcon name="arrow-right" size="md" />
          <span class="fab__text">
            {{ nextContributionId ? 'Next' : 'All Done!' }}
          </span>
          <span v-if="remainingContributionsCount > 0" class="fab__count">
            {{ remainingContributionsCount }}
          </span>
        </button>
      </Transition>
    </Teleport>
  </AppShell>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppShell from '../components/templates/AppShell.vue'
import PageHeader from '../components/molecules/PageHeader.vue'
import HhCard from '../components/molecules/HhCard.vue'
import HhText from '../components/atoms/HhText.vue'
import HhIcon from '../components/atoms/HhIcon.vue'
import HhBadge from '../components/atoms/HhBadge.vue'
import HhButton from '../components/atoms/HhButton.vue'
import HhVerdictPicker from '../components/atoms/HhVerdictPicker.vue'
import HhTextarea from '../components/atoms/HhTextarea.vue'
import {
  getContribution,
  getKeyMessages,
  getStances,
  submitKeyMessageEvaluation,
  submitStanceEvaluation as apiSubmitStance,
  getKeyMessageEvaluations,
  getStanceEvaluations,
  submitAddedKeyMessage,
  getAddedKeyMessages,
  getContributionsStats,
} from '../services/api.js'
import { useEvaluator } from '../composables/useEvaluator.js'

const route = useRoute()
const router = useRouter()
const { evaluator } = useEvaluator()

const contributionId = Number(route.params.id)
const loading = ref(true)
const error = ref(false)
const contribution = ref(null)
const keyMessages = ref([])
const expandedKm = ref(null)
const expandedAddedKm = ref(null)  // NEW: Track expanded added key message

// Per-key-message evaluation state: { verdict, comment }
const kmEvaluations = reactive({})
const submittingKm = reactive({})
const kmSaveStatus = reactive({})

// Per-stance evaluation state: keyed by stanceKey(km, stance)
const stanceEvaluations = reactive({})
const submittingStance = reactive({})
const stanceSaveStatus = reactive({})

// Evaluator-added key messages
const addedKeyMessages = ref([])           // previously saved entries from backend
const showAddKmForm = ref(false)           // toggle the "add" form
const newKm = reactive({
  key_message: '',
  key_message_type: '',
  key_message_sentence: '',
})
const submittingNewKm = ref(false)
const newKmSaveStatus = ref(null)          // null | 'saved' | 'error'

// NEW: Stance assignment for added key messages
const availableComments = ref([])          // all comments from contribution
const showStancesSelector = ref(false)     // toggle stance selector UI
const loadingComments = ref(false)         // loading state for comments

// Editing stances on already-saved added key messages (incl. older ones
// created before stance labeling existed, which have zero stances)
const editingAddedKmId = ref(null)         // id of AddedKeyMessage being edited, or null
const addedKmStanceDrafts = reactive({})   // keyed by akm.id -> [{ comment_text, comment_index, stance_label }]
const submittingAddedKmEdit = reactive({}) // keyed by akm.id -> bool
const addedKmEditSaveStatus = reactive({}) // keyed by akm.id -> null | 'saved' | 'error'

// Navigation & Progress - For FAB and next contribution logic
const allContributionsStats = ref([])

const KM_TYPES = ['Zustand', 'Wunsch', 'Problem', 'Qualität']

function stanceKey(km, stance, index = null) {
  const idx = index !== undefined && index !== null ? index : (stance.index !== undefined && stance.index !== null ? stance.index : 'null')
  return `${km.key_message}__${stance.comment_text}__${idx}`
}

// --- Type/stance label helpers ---

function kmTypeBadgeVariant(type) {
  const map = {
    Zustand: 'navy',
    Wunsch: 'warning',
    Problem: 'red',
    Qualität: 'success',
  }
  return map[type] ?? 'default'
}

function stanceBadgeVariant(stance) {
  if (stance === 'in favor') return 'success'
  if (stance === 'ablehnung') return 'red'
  return 'default'
}

function stanceLabel(stance) {
  if (stance === 'in favor') return 'In favor'
  if (stance === 'ablehnung') return 'Against'
  return 'Neutral'
}

// --- Progress Tracking & Navigation ---

const totalItemsCount = computed(() => {
  const kmCount = keyMessages.value.length
  const stanceCount = keyMessages.value.reduce((sum, km) => {
    return sum + (km.stances?.length || 0)
  }, 0)
  // Each evaluator-added key message counts as one item, considered
  // "evaluated" once its comments have been stance-labeled.
  const addedKmCount = addedKeyMessages.value.length
  return kmCount + stanceCount + addedKmCount
})

const evaluatedItemsCount = computed(() => {
  // Count evaluated key messages
  const kmEvaluated = keyMessages.value.filter(km => 
    kmEvaluations[km.key_message]?.verdict
  ).length
  
  // Count evaluated stances
  let stancesEvaluated = 0
  keyMessages.value.forEach(km => {
    if (km.stances) {
      km.stances.forEach(stance => {
        const k = stanceKey(km, stance, stance.index)
        if (stanceEvaluations[k]?.verdict) {
          stancesEvaluated++
        }
      })
    }
  })

  // Count added key messages that have been stance-labeled
  const addedKmEvaluated = addedKeyMessages.value.filter(akm => akm.stances?.length > 0).length
  
  return kmEvaluated + stancesEvaluated + addedKmEvaluated
})

const contributionCompletionPercentage = computed(() => {
  if (totalItemsCount.value === 0) return 0
  return Math.round((evaluatedItemsCount.value / totalItemsCount.value) * 100)
})

const nextContributionId = computed(() => {
  if (!evaluator.value || allContributionsStats.value.length === 0) return null
  
  const stats = allContributionsStats.value
  
  // Helper to calculate progress percentage
  const getProgress = (stat) => {
    const totalItems = stat.key_messages_count + stat.stances_count + stat.added_key_messages_count
    const evaluatedItems = stat.evaluated_key_messages_count + stat.evaluated_stances_count +
      (stat.added_key_messages_count - stat.added_key_messages_missing_stances_count)
    if (totalItems === 0) return 100 // No items = complete
    return (evaluatedItems / totalItems) * 100
  }
  
  // Filter incomplete contributions (excluding current one)
  const incomplete = stats.filter(stat => {
    if (stat.contribution_id === contributionId) return false
    const progress = getProgress(stat)
    return progress < 100
  })
  
  if (incomplete.length === 0) return null
  
  // 1. Find first untouched contribution (0% progress)
  const untouched = incomplete.find(stat => getProgress(stat) === 0)
  if (untouched) return untouched.contribution_id
  
  // 2. Find contribution with lowest progress (incomplete work)
  const sorted = [...incomplete].sort((a, b) => getProgress(a) - getProgress(b))
  return sorted[0]?.contribution_id || null
})

const remainingContributionsCount = computed(() => {
  if (!evaluator.value || allContributionsStats.value.length === 0) return 0
  
  return allContributionsStats.value.filter(stat => {
    const totalItems = stat.key_messages_count + stat.stances_count + stat.added_key_messages_count
    const evaluatedItems = stat.evaluated_key_messages_count + stat.evaluated_stances_count +
      (stat.added_key_messages_count - stat.added_key_messages_missing_stances_count)
    return evaluatedItems < totalItems && totalItems > 0
  }).length
})

function goToNextContribution() {
  if (nextContributionId.value) {
    router.push(`/evaluation/contributions/${nextContributionId.value}`)
  } else {
    // All done! Redirect to overview with success message
    router.push('/evaluation?message=all_complete')
  }
}

function scrollToFirstUnevaluated() {
  // Find first key message without verdict
  for (const km of keyMessages.value) {
    const kmKey = km.key_message
    if (!kmEvaluations[kmKey] || kmEvaluations[kmKey].verdict === null) {
      const element = document.querySelector(`[data-km-id="${CSS.escape(kmKey)}"]`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Flash highlight
        element.classList.add('highlight-flash')
        setTimeout(() => element.classList.remove('highlight-flash'), 2000)
        return true
      }
    }
    
    // Check stances within this key message
    if (km.stances) {
      for (const stance of km.stances) {
        const stanceK = stanceKey(km, stance, stance.index)
        if (!stanceEvaluations[stanceK] || stanceEvaluations[stanceK].verdict === null) {
          const element = document.querySelector(`[data-stance-id="${CSS.escape(stanceK)}"]`)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            element.classList.add('highlight-flash')
            setTimeout(() => element.classList.remove('highlight-flash'), 2000)
            return true
          }
        }
      }
    }
  }
  
  // Check evaluator-added key messages missing stances (includes older ones
  // created before stance labeling existed)
  for (let i = 0; i < addedKeyMessages.value.length; i++) {
    const akm = addedKeyMessages.value[i]
    if (!akm.stances || akm.stances.length === 0) {
      expandedAddedKm.value = i
      toggleEditAddedKmStances(akm)
      const element = document.querySelector(`[data-added-km-id="${akm.id}"]`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.classList.add('highlight-flash')
        setTimeout(() => element.classList.remove('highlight-flash'), 2000)
      }
      return true
    }
  }
  
  // No unevaluated items found
  return false
}

// --- Accordion ---

async function toggleKm(index) {
  if (expandedKm.value === index) {
    expandedKm.value = null
    return
  }
  expandedKm.value = index
  const km = keyMessages.value[index]
  if (km.stances === undefined) {
    await loadStances(km)
  }
}

// Toggle added key message expansion
function toggleAddedKm(index) {
  if (expandedAddedKm.value === index) {
    expandedAddedKm.value = null
  } else {
    expandedAddedKm.value = index
  }
}

async function loadStances(km) {
  km.stancesLoading = true
  km.stancesError = false
  try {
    const stances = await getStances(contributionId, km.key_message)
    // Add index to each stance
    const stancesWithIndex = stances.map((stance, index) => ({
      ...stance,
      index: index
    }))
    km.stances = stancesWithIndex
    // Initialise stance evaluation state
    for (const stance of stancesWithIndex) {
      const k = stanceKey(km, stance, stance.index)
      if (!stanceEvaluations[k]) {
        stanceEvaluations[k] = { verdict: null, correctedLabel: null, comment: '' }
        submittingStance[k] = false
        stanceSaveStatus[k] = null
      }
    }
    // Prefill existing stance evaluations from backend
    if (evaluator.value) {
      try {
        const existing = await getStanceEvaluations({
          contribution_id: contributionId,
          evaluator: evaluator.value,
        })
        for (const ev of existing) {
          const matchingKm = keyMessages.value.find(k => k.key_message === ev.key_message)
          if (!matchingKm || !matchingKm.stances) continue
          
          // STRICT MATCHING: Match by exact index or both NULL
          const matchingStance = matchingKm.stances.find(s => {
            const textMatches = s.comment_text === ev.comment_text
            const indexMatches = (s.index === ev.comment_index) || 
                                 (s.index === null && ev.comment_index === null)
            return textMatches && indexMatches
          })
          
          if (matchingStance) {
            const k = stanceKey(matchingKm, matchingStance, matchingStance.index)
            if (stanceEvaluations[k] !== undefined) {
              stanceEvaluations[k].verdict = ev.verdict
              stanceEvaluations[k].correctedLabel = ev.corrected_label || null
              stanceEvaluations[k].comment = ev.comment || ''
            }
          }
        }
      } catch { /* ignore prefill errors */ }
    }
  } catch {
    km.stancesError = true
    km.stances = []
  } finally {
    km.stancesLoading = false
  }
}

// --- Submit key message evaluation ---
async function submitKmEvaluation(km) {
  const key = km.key_message
  submittingKm[key] = true
  kmSaveStatus[key] = null
  try {
    await submitKeyMessageEvaluation({
      contribution_id: contributionId,
      key_message: km.key_message,
      verdict: kmEvaluations[key].verdict,
      comment: kmEvaluations[key].comment || null,
      evaluator: evaluator.value || null,
      suggested_key_message: kmEvaluations[key].suggested_key_message || null,
      suggested_sentence: kmEvaluations[key].suggested_sentence || null,
    })
    kmSaveStatus[key] = 'saved'
  } catch {
    kmSaveStatus[key] = 'error'
  } finally {
    submittingKm[key] = false
  }
}

// --- Submit stance evaluation ---
async function submitStanceEvaluation(km, stance) {
  const k = stanceKey(km, stance, stance.index)
  const eval_ = stanceEvaluations[k]
  
  // Validation: if incorrect, correctedLabel should be selected
  if (eval_.verdict === 'incorrect' && !eval_.correctedLabel) {
    alert('Please select the correct label.')
    return
  }
  
  submittingStance[k] = true
  stanceSaveStatus[k] = null
  try {
    await apiSubmitStance({
      contribution_id: contributionId,
      key_message: km.key_message,
      comment_text: stance.comment_text,
      comment_index: stance.index ?? null,
      verdict: eval_.verdict,
      corrected_label: eval_.correctedLabel,
      comment: eval_.comment || null,
      evaluator: evaluator.value || null,
    })
    stanceSaveStatus[k] = 'saved'
  } catch {
    stanceSaveStatus[k] = 'error'
  } finally {
    submittingStance[k] = false
  }
}

// --- Load available comments for stance assignment ---
/**
 * Load all available comments from AI-predicted stances
 * across all key messages. Called when user opens the
 * "add key message" form.
 */
async function loadAvailableComments() {
  if (loadingComments.value || availableComments.value.length > 0) {
    return // Already loaded
  }
  
  loadingComments.value = true
  
  try {
    // Ensure all key messages have loaded stances
    await Promise.all(
      keyMessages.value.map(km => {
        if (!km.stances) {
          return loadStances(km)
        }
        return Promise.resolve()
      })
    )
    
    // Aggregate all comments from all key messages
    const allComments = []
    const seenComments = new Set() // Deduplicate by text+index
    
    for (const km of keyMessages.value) {
      if (km.stances && km.stances.length > 0) {
        for (const stance of km.stances) {
          const key = `${stance.comment_text}__${stance.index}`
          
          if (!seenComments.has(key)) {
            allComments.push({
              comment_text: stance.comment_text,
              comment_index: stance.index,
              stance_label: 'neutral', // Default stance
            })
            seenComments.add(key)
          }
        }
      }
    }
    
    availableComments.value = allComments
  } catch (err) {
    console.error('Failed to load comments:', err)
  } finally {
    loadingComments.value = false
  }
}

// Watch for form opening and load comments
watch(showAddKmForm, async (isOpen) => {
  if (isOpen && availableComments.value.length === 0) {
    await loadAvailableComments()
  }
})

// --- Edit stances on an already-saved added key message ---
/**
 * Build the working draft of stance labels for an added key message,
 * pre-filling from any stances it already has and defaulting the rest
 * to 'neutral'. Covers both older added key messages that predate the
 * stance-labeling feature (zero stances) and ones that already have
 * some stances the evaluator wants to revise.
 */
function buildStanceDraftForAddedKm(akm) {
  const existingByKey = new Map()
  for (const s of akm.stances || []) {
    existingByKey.set(`${s.comment_text}__${s.comment_index ?? 'null'}`, s.stance_label)
  }
  return availableComments.value.map(c => ({
    comment_text: c.comment_text,
    comment_index: c.comment_index,
    stance_label: existingByKey.get(`${c.comment_text}__${c.comment_index ?? 'null'}`) || 'neutral',
  }))
}

async function toggleEditAddedKmStances(akm) {
  if (editingAddedKmId.value === akm.id) {
    editingAddedKmId.value = null
    return
  }
  if (availableComments.value.length === 0) {
    await loadAvailableComments()
  }
  addedKmStanceDrafts[akm.id] = buildStanceDraftForAddedKm(akm)
  addedKmEditSaveStatus[akm.id] = null
  editingAddedKmId.value = akm.id
}

async function saveAddedKmStances(akm) {
  const draft = addedKmStanceDrafts[akm.id]
  if (!draft || draft.length === 0) return

  submittingAddedKmEdit[akm.id] = true
  addedKmEditSaveStatus[akm.id] = null
  try {
    const payload = {
      contribution_id: contributionId,
      key_message: akm.key_message,
      key_message_type: akm.key_message_type,
      key_message_sentence: akm.key_message_sentence || null,
      evaluator: evaluator.value || akm.evaluator || null,
      stances: draft.map(c => ({
        comment_text: c.comment_text,
        comment_index: c.comment_index,
        stance_label: c.stance_label,
      })),
    }
    const saved = await submitAddedKeyMessage(payload)

    // Replace the item in-place with the updated record from the backend
    const idx = addedKeyMessages.value.findIndex(k => k.id === akm.id)
    if (idx !== -1) {
      addedKeyMessages.value[idx] = saved
    }

    addedKmEditSaveStatus[akm.id] = 'saved'
    editingAddedKmId.value = null
  } catch (err) {
    console.error('Failed to save stances for added key message:', err)
    addedKmEditSaveStatus[akm.id] = 'error'
  } finally {
    submittingAddedKmEdit[akm.id] = false
  }
}

// --- Submit evaluator-added key message ---
async function submitNewKmEvaluation() {
  // Validate we have comments loaded
  if (availableComments.value.length === 0) {
    alert('Please load comments first by expanding key messages above.')
    return
  }
  
  submittingNewKm.value = true
  newKmSaveStatus.value = null
  
  try {
    const payload = {
      contribution_id: contributionId,
      key_message: newKm.key_message.trim(),
      key_message_type: newKm.key_message_type,
      key_message_sentence: newKm.key_message_sentence.trim() || null,
      evaluator: evaluator.value || null,
      stances: availableComments.value.map(c => ({
        comment_text: c.comment_text,
        comment_index: c.comment_index,
        stance_label: c.stance_label,
      })),
    }
    
    const saved = await submitAddedKeyMessage(payload)
    addedKeyMessages.value.push(saved)
    newKmSaveStatus.value = 'saved'
    
    // Reset form
    newKm.key_message = ''
    newKm.key_message_type = ''
    newKm.key_message_sentence = ''
    
    // Reset all stance labels to neutral
    availableComments.value.forEach(c => {
      c.stance_label = 'neutral'
    })
    
    showStancesSelector.value = false
    
  } catch (err) {
    console.error('Failed to save added key message:', err)
    newKmSaveStatus.value = 'error'
  } finally {
    submittingNewKm.value = false
  }
}

// --- Bootstrap ---
onMounted(async () => {
  try {
    const [contrib, kms] = await Promise.all([
      getContribution(contributionId),
      getKeyMessages(contributionId),
    ])
    contribution.value = contrib

    // Attach reactive stances fields
    keyMessages.value = kms.map(km => ({
      ...km,
      stances: undefined,
      stancesLoading: false,
      stancesError: false,
    }))

    // Initialise key-message evaluation state
    for (const km of kms) {
      kmEvaluations[km.key_message] = {
        verdict: null,
        comment: '',
        suggested_key_message: '',
        suggested_sentence: '',
      }
      submittingKm[km.key_message] = false
      kmSaveStatus[km.key_message] = null
    }

    // Prefill existing key-message evaluations
    if (evaluator.value) {
      try {
        const existing = await getKeyMessageEvaluations({
          contribution_id: contributionId,
          evaluator: evaluator.value,
        })
        for (const ev of existing) {
          if (kmEvaluations[ev.key_message] !== undefined) {
            kmEvaluations[ev.key_message].verdict = ev.verdict
            kmEvaluations[ev.key_message].comment = ev.comment || ''
            kmEvaluations[ev.key_message].suggested_key_message = ev.suggested_key_message || ''
            kmEvaluations[ev.key_message].suggested_sentence = ev.suggested_sentence || ''
          }
        }
      } catch { /* ignore prefill errors */ }

      // Prefill evaluator-added key messages
      try {
        addedKeyMessages.value = await getAddedKeyMessages({
          contribution_id: contributionId,
          evaluator: evaluator.value,
        })
      } catch { /* ignore prefill errors */ }
      
      // Fetch contribution stats for navigation
      try {
        allContributionsStats.value = await getContributionsStats({
          evaluator: evaluator.value,
        })
      } catch { /* ignore stats fetch errors */ }
    }
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* Contribution text */
.contribution-card { margin-bottom: var(--space-8); }
.contribution-text { margin: 0; line-height: var(--line-height-loose); }

/* Section header */
.section-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}
.section-hint {
  margin-bottom: var(--space-5);
}

/* Contribution Progress Bar */
.contribution-progress {
  margin-bottom: var(--space-6);
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.contribution-progress__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.contribution-progress__stats {
  font-weight: 500;
  color: var(--color-text-primary);
}

.contribution-progress__percentage {
  color: var(--color-accent);
  font-weight: 600;
}

.contribution-progress__bar {
  height: 8px;
  background: var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.contribution-progress__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent) 0%, #28a745 100%);
  transition: width 0.3s ease;
  border-radius: 4px;
}

/* Jump to Next Unevaluated Button */
.contribution-actions {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

/* Highlight flash animation */
@keyframes highlight-flash {
  0%, 100% { box-shadow: 0 0 0 0 transparent; }
  50% { box-shadow: 0 0 0 4px rgba(0, 105, 217, 0.4); }
}

.highlight-flash {
  animation: highlight-flash 2s ease;
}

/* Key message list */
.key-messages-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* Key message block */
.km-block {
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: border-color var(--transition-fast);
}
.km-block--expanded {
  border-color: var(--color-accent);
}

/* Evaluated key messages - subtle but readable */
.km-block--evaluated {
  background: #f8f9fa;
  border-color: #e0e0e0;
}

.km-block--evaluated .km-block__text {
  color: var(--color-text-secondary);
}

/* Highlight unevaluated key messages */
.km-block--unevaluated:not(.km-block--expanded) {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 1px var(--color-accent);
}

.km-block__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  cursor: pointer;
  user-select: none;
  transition: background var(--transition-fast);
}
.km-block__header:hover { background: var(--color-hh-gray-50); }

.km-block__left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
  min-width: 0;
}
.km-block__text { flex: 1; }

.km-block__right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
}
.km-block__chevron { color: var(--color-text-secondary); }

/* Verdict pill */
.verdict-pill {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  padding: 3px 10px;
  border-radius: var(--radius-full);
  text-transform: capitalize;
}
.verdict-pill--correct {
  background: #E6F9F0;
  color: #1A7A4A;
}
.verdict-pill--incorrect {
  background: var(--color-accent-subtle);
  color: var(--color-accent);
}

/* Expanded body */
.km-block__body {
  border-top: 1px solid var(--color-border);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* AI explanation */
.km-explanation__label {
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: var(--space-1);
}
.km-explanation__text { margin: 0; }

/* Eval form */
.eval-form__label { margin-bottom: var(--space-3); }
.eval-form__controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  align-items: flex-start;
}
.eval-form__textarea { align-self: stretch; }
.eval-form__status { margin-top: var(--space-1); }
.eval-form__footer {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-3);
}

/* Suggestion block */
.suggestion-block {
  margin-top: var(--space-4);
  padding: var(--space-4);
  background: var(--color-accent-subtle);
  border: 1.5px solid var(--color-accent);
  border-radius: var(--radius-md);
}
.suggestion-block__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}
.suggestion-block__icon { color: var(--color-accent); }
.suggestion-block__hint { margin-bottom: var(--space-4); }
.suggestion-block__fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.suggestion-block__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.suggestion-block__field-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* Suggestion transition */
.suggestion-enter-active {
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}
.suggestion-leave-active {
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}
.suggestion-enter-from,
.suggestion-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* Stances section */
.stances-section {
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-5);
}
.stances-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}
.stances-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Stance card */
.stance-card {
  position: relative;
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  transition: all var(--transition-fast);
}

/* Evaluated stances - subtle but readable */
.stance-card--evaluated {
  background: #f8f9fa;
  border-color: #e0e0e0;
}

.stance-card--evaluated .stance-card__comment {
  color: var(--color-text-secondary);
}

/* Highlight unevaluated stances */
.stance-card--unevaluated {
  border-left: 3px solid var(--color-accent);
  background: rgba(0, 105, 217, 0.02);
  box-shadow: 0 0 0 1px rgba(0, 105, 217, 0.1);
}

/* Status badge positioning */
.stance-card__status {
  position: absolute;
  top: 12px;
  right: 12px;
}
.stance-card__comment {
  margin: 0;
  font-style: italic;
  color: var(--color-text-primary);
}
.stance-card__prediction {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.stance-card__correction {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  background: var(--color-surface);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--color-accent);
}
.stance-card__details { }
.stance-card__summary {
  cursor: pointer;
  list-style: none;
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}
.stance-card__explanation {
  margin-top: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface);
  border-left: 3px solid var(--color-border);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

/* Inline eval form for stances */
.eval-form--inline {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--space-3);
}
.eval-form--inline .eval-form__textarea {
  flex: 1;
  min-width: 200px;
}

/* Stance eval form with label picker */
.eval-form--stance {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* Label picker */
.label-picker {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--color-surface-subtle, #f5f5f5);
  border-radius: var(--radius-md);
  margin-top: var(--space-2);
}

.label-picker__buttons {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.label-picker__button--active {
  background: var(--color-accent) !important;
  color: white !important;
  border-color: var(--color-accent) !important;
}

/* Expand transition */
.expand-enter-active,
.expand-leave-active {
  transition: opacity var(--transition-fast);
}
.expand-enter-from,
.expand-leave-to { opacity: 0; }

/* States */
.state-message {
  padding: var(--space-8);
  text-align: center;
}
.state-message--error { color: var(--color-accent); }

/* Added key messages section */
.added-km-section-header {
  margin-top: var(--space-10);
}

.added-km-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.added-km-item {
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.added-km-item__left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.added-km-item__sentence {
  margin: 0;
  font-style: italic;
  padding-left: var(--space-1);
}

/* Add key message toggle button */
.add-km-toggle {
  margin-bottom: var(--space-3);
}

/* Add key message form */
.add-km-form {
  padding: var(--space-4);
  background: var(--color-accent-subtle);
  border: 1.5px solid var(--color-accent);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-6);
}

.add-km-form__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}

.add-km-form__icon { color: var(--color-accent); }

.add-km-form__hint {
  margin-bottom: var(--space-4);
}

.add-km-form__fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.add-km-form__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.add-km-form__field-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* Type picker */
.add-km-type-picker {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.add-km-type-btn {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
}

.add-km-type-btn:hover:not(:disabled) {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.add-km-type-btn--active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}

.add-km-type-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Floating Action Button (FAB) */
.fab {
  position: fixed;
  bottom: 32px;
  right: 32px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  font-family: var(--font-family);
  transition: all 0.2s ease;
  z-index: 1000;
}

.fab:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.fab:disabled {
  background: var(--color-success, #28a745);
  cursor: not-allowed;
  opacity: 0.9;
}

.fab__text {
  font-weight: 600;
}

.fab__count {
  background: rgba(255, 255, 255, 0.3);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 14px;
}

/* FAB transitions */
.fab-enter-active,
.fab-leave-active {
  transition: all 0.3s ease;
}

.fab-enter-from,
.fab-leave-to {
  transform: translateY(100px);
  opacity: 0;
}

/* ===========================
   Add Key Message: Stance Assignment
   =========================== */

.add-km-stances-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.add-km-stances-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-top: var(--space-3);
  padding: var(--space-3);
  background: var(--color-surface-subtle, #f8f9fa);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  max-height: 400px;
  overflow-y: auto;
}

.add-km-stances-empty {
  padding: var(--space-4);
  text-align: center;
}

.add-km-stance-item {
  display: flex;
  gap: var(--space-2);
  align-items: flex-start;
  padding: var(--space-3);
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.add-km-stance-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.add-km-stance-text {
  font-size: var(--font-size-body);
  line-height: 1.5;
  color: var(--color-text-primary);
}

.add-km-stance-label-picker {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-border);
}

.label-picker-label {
  font-weight: 600;
}

.add-km-validation-hint {
  margin-top: var(--space-1);
  display: block;
}

/* Empty stances message */
.stances-empty {
  padding: var(--space-4);
  background: var(--color-surface-subtle, #f8f9fa);
  border-radius: var(--radius-sm);
  text-align: center;
}

/* Fade transition for label picker */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
